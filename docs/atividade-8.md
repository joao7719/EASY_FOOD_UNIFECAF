# Atividade 8 — Correção do cardápio e upload de imagens

## 1. Correção do cadastro de pratos

O endpoint `POST /restaurants/:restaurantId/dishes` recebe os dados do prato no corpo JSON e obtém o restaurante pela URL. O ID é convertido e validado em `src/modules/dishes/dish.service.js`; em seguida, a existência do restaurante é consultada. Se não existir, a API responde `404` em vez de tentar inserir um prato órfão.

A persistência associa explicitamente o registro ao restaurante com `restaurant: { connect: { id } }`. Assim, o ID da URL é a fonte de verdade, a relação Prisma e a chave estrangeira do PostgreSQL são respeitadas e um eventual `restaurantId` informado indevidamente no corpo não troca o restaurante de destino. O controller converte a operação bem-sucedida em `201 Created`; a rota exige JWT.

Arquivos do fluxo:

- `src/modules/dishes/dish.routes.js` — rota e middleware JWT.
- `src/modules/dishes/dish.controller.js` — valida a entrada HTTP e responde `201`/erros.
- `src/modules/dishes/dish.service.js` — valida os dados, verifica o restaurante e persiste a relação.
- `prisma/schema.prisma` — relação `Restaurant.dishes` / `Dish.restaurant`.

O teste automatizado envia `restaurantId: 999` no corpo, mas chama `/restaurants/7/dishes`; a verificação garante que o prato fica associado ao restaurante `7` da URL.

## 2. Imagem do perfil

`POST /auth/me/image` aplica o middleware JWT antes do Multer. O controller passa `req.user.id` — preenchido pelo token — ao service; nenhum identificador livre enviado no formulário controla qual conta será alterada. O arquivo é otimizado, o caminho é salvo em `User.imageUrl`, e `GET /auth/me` retorna os dados atuais do perfil.

## 3. Imagem do prato e restaurante

`POST /dishes/:dishId/image` continua usando JWT, confirma que o prato existe e salva o caminho em `Dish.imageUrl`. A listagem pública do cardápio retorna os campos escalares do prato, incluindo a imagem. O cadastro `POST /restaurants` agora aceita arquivo opcional no campo `image` e persiste `Restaurant.imageUrl`; os clientes antigos que enviam JSON continuam compatíveis.

## 4. Serviço compartilhado e falhas

`src/modules/shared/upload.middleware.js` centraliza Multer, aceita somente os MIME types JPEG/PNG/WebP e limita o arquivo a 5 MB. `src/modules/shared/image.service.js` confere o formato real, corrige orientação, redimensiona até 800 px e converte para WebP. O mesmo serviço armazena imagens em pastas separadas (`profiles`, `dishes`, `restaurants`) e remove caminhos gerados pela própria aplicação.

Se Sharp rejeitar o conteúdo, a resposta é `400`. Falha na gravação do banco remove o arquivo otimizado recém-criado; erro de limite é `413`; falta de JWT é `401`; recurso inexistente é `404`. As pastas de upload são servidas pela aplicação e os arquivos enviados por usuários ficam fora do Git.

## 5. Persistência e testes

A migração `prisma/migrations/20261109000000_add_profile_and_restaurant_images/migration.sql` adiciona colunas opcionais, preservando os dados existentes. Os testes cobrem associação do prato, upload no perfil autenticado, envio multipart no cadastro de restaurante, upload de prato, acesso público ao WebP, formato inválido e prato inexistente.

O dashboard em `/` permite demonstrar os fluxos principais sem um cliente HTTP separado: criar um prato no restaurante escolhido, enviar uma imagem opcional durante o cadastro e enviar/trocar a imagem de um prato já listado. As operações de escrita exigem login.

Execute `npm test`. A suíte automatizada usa stubs do Prisma. Além dela, as migrations e o fluxo HTTP completo foram validados em um PostgreSQL temporário isolado, inclusive após reiniciar a API. Para repetir no seu ambiente de entrega, configure `DATABASE_URL`, aplique `npx prisma migrate deploy` e teste os endpoints com um usuário/restaurante do seu banco.
