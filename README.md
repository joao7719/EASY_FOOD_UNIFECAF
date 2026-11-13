# EasyFood

API acadêmica para restaurantes, autenticação, cardápio e processamento de imagens. O projeto implementa as atividades 1 a 8 com Express, Prisma, PostgreSQL, JWT, bcryptjs, Multer e Sharp.

## Requisitos

- Node.js LTS e npm
- PostgreSQL em execução
- Uma base chamada `easyfood`

## Instalação

```bash
npm install
cp .env.example .env
# ajuste DATABASE_URL e JWT_SECRET no .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm start
```

A API fica em `http://localhost:3000`.

O dashboard web fica em `http://localhost:3000/` e usa a mesma origem da API. Para demonstrar as funcionalidades, crie uma conta e faça login na aba **Usuários**; depois cadastre um restaurante na aba **Restaurantes** e abra **Cardápio** para criar um prato. O formulário aceita uma imagem opcional no cadastro e também permite enviar ou trocar a imagem de um prato já existente.

## Configuração

`DATABASE_URL` e `JWT_SECRET` são obrigatórios para a aplicação. O e-mail usa a API HTTP do Resend quando `EMAIL_API_KEY` está configurada. Sem essa chave, o serviço funciona em modo simulado e não bloqueia o cadastro de restaurantes.

Nunca envie `.env`, credenciais ou imagens enviadas por utilizadores para o repositório.

## Endpoints

### Restaurantes

- `GET /restaurants` — lista pública, incluindo `imageUrl` quando houver foto.
- `POST /restaurants` — cria com JWT; aceita JSON ou `multipart/form-data`.
- `DELETE /restaurants/:id` — remove com JWT.

Campos multipart/JSON do cadastro: `name`, `category`, `rating` (opcional) e `image` (opcional, arquivo JPEG/PNG/WebP até 5 MB).

### Autenticação e perfil

- `POST /auth/register` — cria utilizador e armazena a senha com bcrypt.
- `POST /auth/login` — devolve JWT.
- `GET /auth/me` — exige `Authorization: Bearer <token>` e retorna o perfil atualizado.
- `POST /auth/me/image` — exige JWT e recebe `multipart/form-data` no campo `image`.

A imagem de perfil é vinculada exclusivamente ao usuário identificado pelo token; qualquer ID enviado no formulário é ignorado.

### Cardápio

- `GET /restaurants/:restaurantId/dishes` — lista pratos públicos, incluindo `imageUrl`.
- `POST /restaurants/:restaurantId/dishes` — cria prato com JWT; campos JSON: `name`, `description` e `price`.
- `POST /dishes/:dishId/image` — recebe `multipart/form-data` no campo `image`, com JWT.

Os três uploads aceitam JPEG, PNG e WebP até 5 MB. Sharp corrige a orientação, limita a largura a 800 px e converte para WebP com qualidade 80. Os arquivos processados são armazenados em `uploads/profiles/`, `uploads/dishes/` ou `uploads/restaurants/`, e servidos publicamente sob `/uploads/...`.

## Arquitetura

```text
HTTP -> routes -> controller -> service -> database/prisma -> PostgreSQL
                                      |
                                      +-> shared/email.service
                                      +-> shared/image.service
                                      +-> shared/upload.middleware
```

`server.js` apenas carrega o ambiente e inicia o servidor. `src/app.js` compõe middlewares e módulos. Os ADRs em `docs/adr/` registram as decisões das atividades.

## Testes

```bash
npm test
```

A suíte inclui testes HTTP sem PostgreSQL para as rotas e a interface de demonstração da Atividade 8, além de cobertura de autenticação, otimização de imagens e limites/formato dos uploads. Para validar migrações e persistência em PostgreSQL real, configure `.env`, execute `npx prisma migrate deploy` e teste com a base local.
