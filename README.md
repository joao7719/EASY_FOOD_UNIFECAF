# EasyFood — Atividade 7: Cardápio e processamento de imagens

API EasyFood com cardápio de restaurantes, upload e otimização de imagens, arquitetura em camadas e autenticação JWT.

## Atividade 7 — Onde o professor deve olhar

Esta entrega implementa o cadastro de pratos e o processamento local de imagens descritos na Atividade 7.

- **Rotas, Controller e Service dos pratos:** [`src/modules/dishes/`](src/modules/dishes/)
- **Upload Multer e otimização Sharp:** [`src/modules/shared/`](src/modules/shared/)
- **Modelo e relacionamento Prisma:** [`prisma/schema.prisma`](prisma/schema.prisma)
- **Migração da tabela `Dish`:** [`prisma/migrations/20261022163300_add_dishes/migration.sql`](prisma/migrations/20261022163300_add_dishes/migration.sql)
- **Decisão arquitetural (ADR-005):** [`docs/adr/ADR-005-processamento-de-imagens.md`](docs/adr/ADR-005-processamento-de-imagens.md)
- **Comparação de imagens e respostas da atividade:** [`docs/atividade-7-comparacao-de-imagens.md`](docs/atividade-7-comparacao-de-imagens.md)
- **Testes automatizados:** execute `npm test`.

Endpoints centrais: `GET/POST /restaurants/:restaurantId/dishes` e `POST /dishes/:dishId/image`.

## Visão geral

O projeto EasyFood foi estruturado para separar responsabilidades em camadas:

- `src/database` para a conexão com o Prisma
- `src/modules/restaurants` para a lógica de restaurantes
- `src/modules/dishes` para o cardápio e os pratos
- `src/modules/shared` para upload e processamento compartilhados de imagens
- `src/modules/auth` para autenticação e proteção de rotas
- `src/app.js` para a configuração do Express
- `server.js` para iniciar a aplicação

## Tecnologias

- Node.js
- Express
- Prisma
- MySQL
- JWT
- bcryptjs
- dotenv
- Multer e Sharp (upload e otimização de imagens)

## Pré-requisitos

- Node.js instalado
- MySQL em execução
- npm ou yarn

## Instalação

1. Clone o projeto
2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com a URL do banco e o segredo JWT:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/easyfood"
JWT_SECRET="troque-por-uma-chave-longa-e-aleatoria"
```

## Prisma

Gere o client e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

## Execução

Inicie o servidor:

```bash
node server.js
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Endpoints

### Restaurantes

#### GET /restaurants
Retorna a lista de restaurantes.

#### POST /restaurants
Cria um restaurante. Requer `Authorization: Bearer SEU_TOKEN`.

Body exemplo:

```json
{
  "name": "Cantina Roma",
  "category": "Italiana",
  "rating": 4.5
}
```

#### DELETE /restaurants/:id
Remove um restaurante pelo ID. Requer `Authorization: Bearer SEU_TOKEN`.

### Pratos e cardápio

#### GET /restaurants/:restaurantId/dishes
Lista publicamente os pratos associados ao restaurante.

#### POST /restaurants/:restaurantId/dishes
Cria um prato para o restaurante informado. Requer `Authorization: Bearer SEU_TOKEN`.

```json
{
  "name": "Pizza Margherita",
  "description": "Molho de tomate, queijo e manjericão",
  "price": 49.90
}
```

#### POST /dishes/:dishId/image
Envia a imagem do prato usando `multipart/form-data`, com o campo `image`. Requer JWT. São aceitos JPEG, PNG e WebP até 5 MB; a API redimensiona para no máximo 800 px de largura e salva como WebP em `uploads/dishes/`.

As imagens ficam acessíveis pelo caminho retornado em `imageUrl`, por exemplo `/uploads/dishes/<arquivo>.webp`.

### Autenticação

#### POST /auth/register
Cria um novo usuário.

Body exemplo:

```json
{
  "name": "Aluno",
  "email": "aluno@easyfood.com",
  "password": "123456"
}
```

#### POST /auth/login
Realiza login e retorna JWT.

Body exemplo:

```json
{
  "email": "aluno@easyfood.com",
  "password": "123456"
}
```

#### GET /auth/me
Retorna os dados do usuário autenticado.

Requer header:

```http
Authorization: Bearer SEU_TOKEN
```

## Estrutura do projeto

```text
.
├── adrs/
├── docs/adr/
├── prisma/
├── public/
├── src/
│   ├── app.js
│   ├── database/
│   │   └── prisma.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── dishes/
│   │   ├── restaurants/
│   │   └── shared/
├── uploads/dishes/
├── .env
├── package.json
├── server.js
└── README.md
```

## Observações

- A rota de restaurantes está pública na listagem.
- O cadastro e a exclusão de restaurantes, assim como a criação de pratos e o upload de imagens, exigem autenticação JWT.
- O segredo do JWT deve ser mantido em ambiente seguro.
