const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");
const imageService = require("../shared/image.service");

async function notifyRestaurantCreated(restaurant) {
  const recipient = process.env.EMAIL_NOTIFICATION_TO;
  if (!recipient) {
    console.warn("[EMAIL] EMAIL_NOTIFICATION_TO não configurado; notificação ignorada.");
    return;
  }

  const notifications = [
    {
      toName: restaurant.name,
      subject: `Bem-vindo à EasyFood, ${restaurant.name}!`,
      header: `Olá, ${restaurant.name}!`,
      body: `Seu restaurante foi cadastrado com sucesso na EasyFood.<br/>Categoria: ${restaurant.category || "Não informada"}.`,
      footer: "Equipe EasyFood"
    },
    {
      toName: "Comercial EasyFood",
      subject: `Novo restaurante cadastrado: ${restaurant.name}`,
      header: "Novo restaurante na plataforma",
      body: `Nome: ${restaurant.name}<br/>Categoria: ${restaurant.category || "Não informada"}<br/>Avaliação: ${restaurant.rating ?? "Não informada"}`,
      footer: "Notificação automática - EasyFood"
    }
  ];

  for (const notification of notifications) {
    try {
      await emailService.sendEmail({ to: recipient, ...notification });
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error.message);
    }
  }
}

async function listRestaurants() {
  return prisma.restaurant.findMany({ orderBy: { id: "asc" } });
}

async function createRestaurant(data, imageBuffer) {
  let imageUrl;
  if (imageBuffer) {
    imageUrl = await imageService.optimizeImage(imageBuffer, "restaurants");
  }

  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name.trim(),
        category: data.category.trim(),
        rating: data.rating ?? 0,
        ...(imageUrl ? { imageUrl } : {})
      }
    });

    // O e-mail é uma ação secundária: não deve desfazer o cadastro persistido.
    await notifyRestaurantCreated(restaurant);
    return restaurant;
  } catch (error) {
    if (imageUrl) await imageService.removeOptimizedImage(imageUrl).catch(() => {});
    throw error;
  }
}

async function deleteRestaurant(id) {
  const restaurantId = Number(id);
  const [dishes, existingRestaurant] = await Promise.all([
    prisma.dish.findMany({
      where: { restaurantId },
      select: { imageUrl: true }
    }),
    prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { imageUrl: true }
    })
  ]);
  const restaurant = await prisma.restaurant.delete({
    where: { id: restaurantId }
  });

  await Promise.all([
    ...dishes.map(({ imageUrl }) => imageUrl
      ? imageService.removeOptimizedImage(imageUrl).catch(() => {})
      : Promise.resolve()),
    existingRestaurant?.imageUrl
      ? imageService.removeOptimizedImage(existingRestaurant.imageUrl).catch(() => {})
      : Promise.resolve()
  ]);

  return restaurant;
}

module.exports = {
  listRestaurants,
  createRestaurant,
  deleteRestaurant
};
