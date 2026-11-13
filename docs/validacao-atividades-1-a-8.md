# Validação das atividades 1 a 8

Este documento relaciona os enunciados de aula à implementação atual da EasyFood e registra as verificações executadas no repositório.

## Cobertura no projeto

1. **Base da API:** a aplicação Node/Express expõe `GET /restaurants` e cadastro de restaurantes, agora persistidos pelo Prisma no PostgreSQL.
2. **Evolução e decisões:** `ADR-001` registra a etapa inicial em memória; `ADR-002` documenta a evolução para PostgreSQL e Prisma.
3. **Persistência:** `schema.prisma`, migrations incrementais e `prisma/seed.js` definem e inicializam `Restaurant`, `User` e `Dish`, com a relação restaurante-pratos.
4. **Arquitetura em camadas:** `server.js` inicia o processo; `src/app.js` compõe middlewares e rotas; controllers tratam HTTP; services concentram regras e persistência; `src/database/prisma.js` fornece o cliente compartilhado.
5. **Autenticação:** cadastro e login usam bcrypt; o JWT protege as operações de escrita, e `GET /auth/me` retorna o usuário do token.
6. **E-mail:** `src/modules/shared/email.service.js` centraliza o envio via API Resend. O cadastro do restaurante dispara duas mensagens usando o mesmo serviço, e falhas de e-mail não desfazem o cadastro.
7. **Cardápio e imagens:** o módulo `dishes` cadastra e lista pratos; Sharp corrige orientação, limita a largura e converte para WebP; as imagens são servidas em `/uploads/...`. A comparação da Atividade 7 está em `docs/atividade-7-comparacao-de-imagens.md`.
8. **Correção e demonstração:** o ID do restaurante na URL é a fonte da associação do prato; uploads de perfil e prato usam JWT; o dashboard `/` permite demonstrar cadastro, upload e troca de imagens. A explicação detalhada está em `docs/atividade-8.md`.

## Verificações executadas

- `npm test`: 10 testes passaram, incluindo cadastro protegido, modo simulado de e-mail, envio HTTP do contrato do Resend com resposta simulada e tolerância a falha de e-mail.
- `npx prisma validate` e `npx prisma generate`: schema válido e cliente Prisma gerado.
- PostgreSQL temporário e isolado: as quatro migrations foram aplicadas e o seed inseriu os restaurantes iniciais.
- Fluxo HTTP contra esse PostgreSQL: registro/login, `GET /auth/me`, cadastro JSON/multipart de restaurante, cadastro de prato associado ao restaurante da URL, upload de perfil e prato, acesso público aos WebPs e persistência do restaurante, prato e caminhos de imagem após reiniciar a API.
- O dashboard e seus caminhos de cadastro/upload foram verificados por teste HTTP; a suíte não depende de um banco externo.

## Configuração necessária no ambiente de entrega

O PostgreSQL temporário usado na validação não é o banco do aluno. No ambiente de entrega, configure `DATABASE_URL` e `JWT_SECRET` em `.env`, aplique `npx prisma migrate deploy`, execute `npm run prisma:seed` e inicie com `npm start`.

O envio real de e-mails depende de `EMAIL_API_KEY`, `EMAIL_FROM` e `EMAIL_NOTIFICATION_TO` válidos no `.env`. Sem a chave, o projeto usa o modo simulado; os testes de integração HTTP do serviço usam uma resposta falsa e não enviam mensagens reais. Nenhuma credencial deve ser publicada no GitHub.
