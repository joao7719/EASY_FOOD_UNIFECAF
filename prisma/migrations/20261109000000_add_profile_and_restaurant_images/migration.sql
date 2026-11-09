-- Persistir caminhos de imagens sem alterar os registros existentes.
ALTER TABLE "User" ADD COLUMN "imageUrl" VARCHAR(500);
ALTER TABLE "Restaurant" ADD COLUMN "imageUrl" VARCHAR(500);
