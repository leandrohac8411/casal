# Casal Fit · Nossa rotina

Front-end em React + Vite, pensado primeiro para celular e com quadro compartilhado para notebook. Identidade: Casal Fit, com logo fornecida pelo usuário.

## Executar

```sh
npm install
npm run dev
```

Produção: `npm run build`. Conferência local da produção: `npm run preview`. Testes de regras: `npm test`.

## Entregue

- Entrada por perfil e quadro da casa, inclusive tela cheia.
- Refeições por data com detalhes, marcação e desfazer; cinco planos de Stephany.
- Água com adição e retirada; treinos por data e dias de descanso.
- Conexão opcional com o NEXO Fit (banco do dietalhac): cada perfil entra com o e-mail e senha da própria conta e os treinos concluídos lá (`workout_sessions.finished_at`) marcam o treino do dia automaticamente aqui. A dieta continua sendo só a deste projeto — nada do NEXO Fit é usado para refeições.
- Calendário navegável, detalhe do dia e métricas calculadas somente dos registros reais locais.
- Histórico com cópia do planejamento de cada dia registrado; trocar plano não modifica outras datas.
- Persistência em localStorage e atualização entre abas do mesmo navegador. Sem sincronização entre dispositivos.
- Layout responsivo, navegação por teclado, modal nativo e preferência por movimento reduzido.

## Limites desta etapa

Sem Firebase, autenticação ou integração NEXO. Selecionar perfil não é autenticar. Os registros desta prévia ficam neste navegador. Dados de Leandro são explicitamente ilustrativos; não representam prescrição. A programação semanal dos treinos é um exemplo visual. Planos de Stephany transcritos da referência fornecida, sem cálculo nutricional validado.

## NEXO Fit (dietalhac)

`src/nexo.js` cria um cliente Supabase por perfil (chave de sessão própria, `nexo-auth-<perfil>`), então Stephany e Leandro podem ficar conectados ao mesmo tempo no mesmo navegador sem uma sessão sobrescrever a outra. É preciso `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` num `.env` local (veja `.env.example`) — os mesmos valores públicos do projeto dietalhac.

Ao conectar (e a cada entrada no perfil ou no quadro da casa), o app lê `workout_sessions` do próprio usuário via RLS (só linhas com `finished_at` preenchido, dos últimos 60 dias) e, para qualquer data com treino concluído lá, marca todos os treinos daquele dia como feitos aqui — inclusive retroativo, mesmo que o dia nunca tenha sido aberto no Casal Fit. É uma marcação por dia, não por treino específico (ex.: musculação vs. jiu-jitsu): um treino concluído no NEXO Fit conta como "treinei hoje" de forma geral. A dieta nunca é lida de lá.

## Próxima integração

`src/store.js` concentra a persistência. `src/domain.js` concentra templates, snapshots e cálculo diário. Ao integrar Firebase, substituir o armazenamento por repositório com assinatura em tempo real, isolamento de acesso e operações transacionais. Não usar regras públicas de banco. Dados nutricionais ainda precisam de fonte validada e metas reais de cada perfil.

Para Vercel: importar este projeto, preset Vite, comando `npm run build`, saída `dist`. Esta entrega não foi publicada e não acessou o banco do NEXO.

## XAMPP

Projeto instalado em C:\xampp\htdocs\casal. Com Apache iniciado, abra http://localhost/casal/. O .htaccess serve dist/index.html. Para atualizar após editar o código: npm install e npm run build:xampp nesta pasta. Para Vercel, use npm run build (base padrão). Firebase e NEXO ainda não estão integrados. Os registros de localhost:5173 não são migrados automaticamente, pois são outra origem do navegador.


