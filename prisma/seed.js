const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.restaurant.createMany({
    data: [
      { name: "Pizzaria Napoli", category: "Pizza", rating: 4.5 },
      { name: "Burger House", category: "Hambúrguer", rating: 4.2 },
      { name: "Sushi Express", category: "Japonesa", rating: 4.8 }
    ],
    skipDuplicates: true
  });
  console.log("Dados iniciais inseridos com sucesso!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
