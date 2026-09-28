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
- Versículo do dia na tela de entrada: 365 versículos (Bíblia Livre, CC BY 3.0), um por dia do calendário, revisados manualmente para não repetir tema nem sair de contexto.
- Calendário navegável, detalhe do dia e métricas calculadas somente dos registros reais locais.
- Histórico com cópia do planejamento de cada dia registrado; trocar plano não modifica outras datas.
- Persistência em localStorage e atualização entre abas do mesmo navegador. Sem sincronização entre dispositivos.
- Layout responsivo, navegação por teclado, modal nativo e preferência por movimento reduzido.
- Cadastro e login reais com Firebase Authentication (e-mail/senha), recuperação de senha por e-mail.
- Onboarding em etapas após o cadastro (dados pessoais, objetivo, rotina, alimentação, treino), salvo em Firestore.
- Vínculo do casal por código de convite (gera código, o parceiro entra com ele para vincular as contas).

## Limites desta etapa

Sem integração NEXO. O restante do app (refeições, água, treinos, calendário) continua em localStorage, ainda não migrado para o Firestore — só o cadastro/onboarding usa a nuvem por enquanto. Dados de Leandro são explicitamente ilustrativos; não representam prescrição. A programação semanal dos treinos é um exemplo visual. Planos de Stephany transcritos da referência fornecida, sem cálculo nutricional validado. As respostas do onboarding ainda não alimentam a dieta/treino gerados — isso é a próxima etapa.

## Firebase

Projeto configurado via variáveis de ambiente (ver `.env.example`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Sem essas variáveis, o cadastro mostra um aviso e não quebra o resto do app. Habilitar no console do Firebase: Authentication (e-mail/senha) e Firestore Database. Coleções: `users/{uid}` (perfil, onboarding, `coupleId`), `couples/{id}` (`memberUids`, `inviteCode`) e `profilePhotos/{personKey}` (foto de cada perfil).

Fotos de perfil não usam o Firebase Storage (exige plano pago). São comprimidas no navegador e salvas como base64 direto no documento do Firestore — dentro do limite de 1 MB por documento.

## Próxima integração

`src/store.js` concentra a persistência local (refeições, água, treinos). `src/domain.js` concentra templates, snapshots e cálculo diário. `src/cloud.js` concentra a persistência no Firestore (usuário, onboarding, vínculo do casal). Próximo passo: migrar os registros diários para o Firestore por casal, e usar as respostas do onboarding para gerar dieta/treino personalizados em vez dos planos fixos atuais.

Para Vercel: importar este projeto, preset Vite, comando `npm run build`, saída `dist`, e configurar as variáveis `VITE_FIREBASE_*` no painel do projeto.

## XAMPP

Projeto instalado em C:\xampp\htdocs\casal. Com Apache iniciado, abra http://localhost/casal/. O .htaccess serve dist/index.html. Para atualizar após editar o código: npm install e npm run build:xampp nesta pasta. Para Vercel, use npm run build (base padrão). Os registros de localhost:5173 não são migrados automaticamente, pois são outra origem do navegador.


