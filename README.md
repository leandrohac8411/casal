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
- Conexão automática com o NEXO Fit (dietalhac): o app chama a API dele em segundo plano, sem tela de login, e marca treino e água do dia sozinho a partir do que já foi registrado lá. A dieta continua sendo só a deste projeto — nada do NEXO Fit é usado para refeições.
- Versículo do dia na tela de entrada: 365 versículos (Bíblia Livre, CC BY 3.0), um por dia do calendário, revisados manualmente para não repetir tema nem sair de contexto.
- Calendário navegável, detalhe do dia e métricas calculadas somente dos registros reais locais.
- Histórico com cópia do planejamento de cada dia registrado; trocar plano não modifica outras datas.
- Persistência em localStorage e atualização entre abas do mesmo navegador. Sem sincronização entre dispositivos.
- Layout responsivo, navegação por teclado, modal nativo e preferência por movimento reduzido.

## Limites desta etapa

Sem Firebase, autenticação ou integração NEXO. Selecionar perfil não é autenticar. Os registros desta prévia ficam neste navegador. Dados de Leandro são explicitamente ilustrativos; não representam prescrição. A programação semanal dos treinos é um exemplo visual. Planos de Stephany transcritos da referência fornecida, sem cálculo nutricional validado.

## NEXO Fit (dietalhac)

`src/nexo.js` chama `GET /api/nexo-status?person=<perfil>` no dietalhac (rota protegida por segredo compartilhado, igual ao padrão do `push-cron`), sem nenhum login no casal. Requer `VITE_NEXO_API_BASE` e `VITE_NEXO_SECRET` num `.env` local (veja `.env.example`) e as mesmas variáveis configuradas no dietalhac (`NEXO_CASAL_SECRET`, `NEXO_LEANDRO_EMAIL`, `NEXO_STEPHANY_EMAIL`) e na Vercel dele.

A cada entrada no perfil ou no quadro da casa, o app sincroniza os últimos 60 dias: para qualquer data com treino concluído no NEXO Fit (`workout_sessions.finished_at`), marca todos os treinos daquele dia como feitos aqui — inclusive retroativo, mesmo que o dia nunca tenha sido aberto no Casal Fit. É uma marcação por dia, não por treino específico (ex.: musculação vs. jiu-jitsu). A água do dia (`water_logs`) também é puxada de lá e sobrescreve o valor local quando muda. A dieta nunca é lida de lá.

## Próxima integração

`src/store.js` concentra a persistência. `src/domain.js` concentra templates, snapshots e cálculo diário. Ao integrar Firebase, substituir o armazenamento por repositório com assinatura em tempo real, isolamento de acesso e operações transacionais. Não usar regras públicas de banco. Dados nutricionais ainda precisam de fonte validada e metas reais de cada perfil.

Para Vercel: importar este projeto, preset Vite, comando `npm run build`, saída `dist`. Esta entrega não foi publicada e não acessou o banco do NEXO.

## XAMPP

Projeto instalado em C:\xampp\htdocs\casal. Com Apache iniciado, abra http://localhost/casal/. O .htaccess serve dist/index.html. Para atualizar após editar o código: npm install e npm run build:xampp nesta pasta. Para Vercel, use npm run build (base padrão). Firebase e NEXO ainda não estão integrados. Os registros de localhost:5173 não são migrados automaticamente, pois são outra origem do navegador.


