const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseId(value, label) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw httpError(`${label} inválido`, 400);
  }
  return id;
}

function validateDish(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw httpError("Informe os dados do prato", 400);
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const price = typeof data.price === "number" || typeof data.price === "string"
    ? Number(data.price)
    : Number.NaN;

  if (!name || name.length > 150) {
    throw httpError("O nome do prato é obrigatório e deve ter até 150 caracteres", 400);
  }
  if (!description || Buffer.byteLength(description, "utf8") > 65535) {
    throw httpError("A descrição do prato é obrigatória e deve ter até 65.535 caracteres", 400);
  }
  if (!Number.isFinite(price) || price <= 0 || price > 99999999.99 || Math.abs(price * 100 - Math.round(price * 100)) > 1e-7) {
    throw httpError("O preço deve ser positivo e ter no máximo duas casas decimais", 400);
  }

  return { name, description, price: price.toFixed(2) };
}

async function createDish(restaurantId, data) {
  const id = parseId(restaurantId, "ID do restaurante");
  const dishData = validateDish(data);
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    throw httpError("Restaurante não encontrado", 404);
  }

  return prisma.dish.create({
    data: { ...dishData, restaurantId: id }
  });
}

async function listDishes(restaurantId) {
  const id = parseId(restaurantId, "ID do restaurante");
  return prisma.dish.findMany({
    where: { restaurantId: id },
    orderBy: { id: "asc" }
  });
}

async function uploadDishImage(dishId, buffer) {
  const id = parseId(dishId, "ID do prato");
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) {
    throw httpError("Prato não encontrado", 404);
  }

  const imageUrl = await imageService.optimizeImage(buffer);
  try {
    const updatedDish = await prisma.dish.update({
      where: { id },
      data: { imageUrl }
    });

    if (dish.imageUrl) {
      await imageService.removeOptimizedImage(dish.imageUrl).catch(() => {});
    }
    return updatedDish;
  } catch (error) {
    await imageService.removeOptimizedImage(imageUrl).catch(() => {});
    throw error;
  }
}

module.exports = {
  createDish,
  listDishes,
  uploadDishImage
};
