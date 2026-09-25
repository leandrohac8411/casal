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

## Limites desta etapa

Sem Firebase, autenticação ou integração NEXO. Selecionar perfil não é autenticar. Os registros desta prévia ficam neste navegador. Dados de Leandro são explicitamente ilustrativos; não representam prescrição. A programação semanal dos treinos é um exemplo visual. Planos de Stephany transcritos da referência fornecida, sem cálculo nutricional validado.

## Próxima integração

`src/store.js` concentra a persistência. `src/domain.js` concentra templates, snapshots e cálculo diário. Ao integrar Firebase, substituir o armazenamento por repositório com assinatura em tempo real, isolamento de acesso e operações transacionais. Não usar regras públicas de banco. Dados nutricionais ainda precisam de fonte validada e metas reais de cada perfil.

Para Vercel: importar este projeto, preset Vite, comando `npm run build`, saída `dist`. Esta entrega não foi publicada e não acessou o banco do NEXO.

## XAMPP

Projeto instalado em C:\xampp\htdocs\casal. Com Apache iniciado, abra http://localhost/casal/. O .htaccess serve dist/index.html. Para atualizar após editar o código: npm install e npm run build:xampp nesta pasta. Para Vercel, use npm run build (base padrão). Firebase e NEXO ainda não estão integrados. Os registros de localhost:5173 não são migrados automaticamente, pois são outra origem do navegador.


