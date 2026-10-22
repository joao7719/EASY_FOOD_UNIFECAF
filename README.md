# EasyFood

API acadêmica para restaurantes, autenticação, cardápio e processamento de imagens. O projeto implementa as atividades 1 a 7 com Express, Prisma, PostgreSQL, JWT, bcryptjs, Multer e Sharp.

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

## Configuração

`DATABASE_URL` e `JWT_SECRET` são obrigatórios para a aplicação. O e-mail usa a API HTTP do Resend quando `EMAIL_API_KEY` está configurada. Sem essa chave, o serviço funciona em modo simulado e não bloqueia o cadastro de restaurantes.

Nunca envie `.env`, credenciais ou imagens enviadas por utilizadores para o repositório.

## Endpoints

### Restaurantes

- `GET /restaurants` — lista pública.
- `POST /restaurants` — cria com JWT.
- `DELETE /restaurants/:id` — remove com JWT.

Body de criação:

```json
{
  "name": "Cantina Roma",
  "category": "Italiana",
  "rating": 4.5
}
```

### Autenticação

- `POST /auth/register` — cria utilizador e armazena a senha com bcrypt.
- `POST /auth/login` — devolve JWT.
- `GET /auth/me` — exige `Authorization: Bearer <token>`.

### Cardápio

- `GET /restaurants/:restaurantId/dishes` — lista pratos publicamente.
- `POST /restaurants/:restaurantId/dishes` — cria prato com JWT.
- `POST /dishes/:dishId/image` — recebe `multipart/form-data` no campo `image`, com JWT.

As imagens aceites são JPEG, PNG e WebP até 5 MB. O Sharp salva a versão otimizada em `uploads/dishes/` como WebP com largura máxima de 800 px. O caminho devolvido em `imageUrl` é público em `/uploads/dishes/...`.

## Arquitetura

```text
HTTP -> routes -> controller -> service -> database/prisma -> PostgreSQL
                                      |
                                      +-> shared/email.service
                                      +-> shared/image.service
```

`server.js` apenas carrega o ambiente e inicia o servidor. `src/app.js` compõe middlewares e módulos. Os ADRs em `docs/adr/` registram as decisões das atividades.

## Testes

```bash
npm test
```

Os testes cobrem validação de autenticação sem banco, otimização de imagem e falhas do upload.
