const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

async function listRestaurants() {
  return prisma.restaurant.findMany();
}

async function createRestaurant(data) {
  return prisma.restaurant.create({
    data: {
      name: data.name,
      category: data.category,
      rating: data.rating || 0
    }
  });
}

async function deleteRestaurant(id) {
  const restaurantId = parseInt(id, 10);
  const dishes = await prisma.dish.findMany({
    where: { restaurantId },
    select: { imageUrl: true }
  });
  const restaurant = await prisma.restaurant.delete({
    where: { id: restaurantId }
  });

  await Promise.all(dishes.map(({ imageUrl }) => {
    return imageUrl ? imageService.removeOptimizedImage(imageUrl).catch(() => {}) : Promise.resolve();
  }));
  return restaurant;
}

module.exports = {
  listRestaurants,
  createRestaurant,
  deleteRestaurant
};
