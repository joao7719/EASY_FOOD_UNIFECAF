const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const prisma = require("../src/database/prisma");
const authRoutes = require("../src/modules/auth/auth.routes");
const restaurantRoutes = require("../src/modules/restaurants/restaurant.routes");
const dishRoutes = require("../src/modules/dishes/dish.routes");
const imageService = require("../src/modules/shared/image.service");

test("Atividade 8: cadastra pratos associados e salva uploads autenticados", async () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousEmailRecipient = process.env.EMAIL_NOTIFICATION_TO;
  process.env.JWT_SECRET = "easyfood-activity8-test-secret";
  process.env.EMAIL_NOTIFICATION_TO = "";

  const original = {
    userFindUnique: prisma.user.findUnique,
    userUpdate: prisma.user.update,
    restaurantFindUnique: prisma.restaurant.findUnique,
    restaurantCreate: prisma.restaurant.create,
    restaurantFindMany: prisma.restaurant.findMany,
    dishFindUnique: prisma.dish.findUnique,
    dishCreate: prisma.dish.create,
    dishUpdate: prisma.dish.update,
    dishFindMany: prisma.dish.findMany
  };
  const storedUrls = [];
  let updatedUser = { id: 41, name: "João", email: "joao@example.com", imageUrl: null };
  let createdRestaurant;
  let lastDishCreate;
  let updatedDish;
  let nextDishId = 1;

  prisma.user.findUnique = async ({ where }) => where.id === 41 ? { ...updatedUser } : null;
  prisma.user.update = async ({ where, data }) => {
    assert.equal(where.id, 41, "o usuário deve vir do JWT, não do multipart");
    updatedUser = { ...updatedUser, ...data };
    return { ...updatedUser };
  };
  prisma.restaurant.findUnique = async ({ where }) => {
    if (createdRestaurant && where.id === createdRestaurant.id) return { ...createdRestaurant };
    return where.id === 7 ? { id: 7, name: "Cantina" } : null;
  };
  prisma.restaurant.create = async ({ data }) => {
    createdRestaurant = { id: 8, ...data };
    return { ...createdRestaurant };
  };
  prisma.restaurant.findMany = async () => createdRestaurant ? [{ ...createdRestaurant }] : [];
  prisma.dish.findUnique = async ({ where }) => {
    if (updatedDish && where.id === updatedDish.id) return { ...updatedDish };
    return null;
  };
  prisma.dish.create = async ({ data }) => {
    lastDishCreate = data;
    return {
      id: ++nextDishId,
      name: data.name,
      description: data.description,
      price: data.price,
      restaurantId: data.restaurant.connect.id,
      imageUrl: null
    };
  };
  prisma.dish.update = async ({ where, data }) => {
    updatedDish = { ...updatedDish, ...data, id: where.id };
    return { ...updatedDish };
  };
  prisma.dish.findMany = async ({ where }) => updatedDish?.restaurantId === where.restaurantId ? [{ ...updatedDish }] : [];

  const app = express();
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use("/auth", authRoutes);
  app.use("/restaurants", restaurantRoutes);
  app.use(dishRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const token = jwt.sign({ sub: 41, email: "joao@example.com" }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${token}` };
    const png = await sharp({
      create: { width: 32, height: 24, channels: 3, background: { r: 190, g: 110, b: 70 } }
    }).png().toBuffer();

    const unauthorized = await fetch(`${baseUrl}/auth/me/image`, {
      method: "POST",
      body: new FormData()
    });
    assert.equal(unauthorized.status, 401);

    const invalidProfileForm = new FormData();
    invalidProfileForm.append("image", new Blob(["texto"], { type: "text/plain" }), "perfil.txt");
    const invalidProfile = await fetch(`${baseUrl}/auth/me/image`, {
      method: "POST",
      headers,
      body: invalidProfileForm
    });
    assert.equal(invalidProfile.status, 400);

    const profileForm = new FormData();
    profileForm.append("userId", "9999");
    profileForm.append("image", new Blob([png], { type: "image/png" }), "perfil.png");
    const profileResponse = await fetch(`${baseUrl}/auth/me/image`, {
      method: "POST",
      headers,
      body: profileForm
    });
    assert.equal(profileResponse.status, 200);
    const profileData = await profileResponse.json();
    assert.equal(profileData.user.id, 41);
    assert.match(profileData.user.imageUrl, /^\/uploads\/profiles\/.+\.webp$/);
    storedUrls.push(profileData.user.imageUrl);
    const publicProfileImage = await fetch(`${baseUrl}${profileData.user.imageUrl}`);
    assert.equal(publicProfileImage.status, 200);
    assert.match(publicProfileImage.headers.get("content-type"), /image\/webp/);

    const meResponse = await fetch(`${baseUrl}/auth/me`, { headers });
    assert.equal((await meResponse.json()).user.imageUrl, profileData.user.imageUrl);

    const restaurantForm = new FormData();
    restaurantForm.append("name", "Cantina Roma");
    restaurantForm.append("category", "Italiana");
    restaurantForm.append("rating", "4.5");
    restaurantForm.append("image", new Blob([png], { type: "image/png" }), "cantina.png");
    const restaurantResponse = await fetch(`${baseUrl}/restaurants`, {
      method: "POST",
      headers,
      body: restaurantForm
    });
    assert.equal(restaurantResponse.status, 201);
    const restaurantData = await restaurantResponse.json();
    assert.match(restaurantData.imageUrl, /^\/uploads\/restaurants\/.+\.webp$/);
    storedUrls.push(restaurantData.imageUrl);

    const dishResponse = await fetch(`${baseUrl}/restaurants/7/dishes`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Lasanha", description: "Lasanha da casa", price: 32.5, restaurantId: 999 })
    });
    assert.equal(dishResponse.status, 201);
    const createdDish = await dishResponse.json();
    assert.equal(createdDish.restaurantId, 7);
    assert.deepEqual(lastDishCreate.restaurant, { connect: { id: 7 } });

    const missingDishForm = new FormData();
    missingDishForm.append("image", new Blob([png], { type: "image/png" }), "prato.png");
    const missingDish = await fetch(`${baseUrl}/dishes/999/image`, {
      method: "POST",
      headers,
      body: missingDishForm
    });
    assert.equal(missingDish.status, 404);

    updatedDish = {
      id: createdDish.id,
      name: createdDish.name,
      description: createdDish.description,
      price: createdDish.price,
      restaurantId: 7,
      imageUrl: null
    };
    const dishForm = new FormData();
    dishForm.append("image", new Blob([png], { type: "image/png" }), "lasanha.png");
    const imageResponse = await fetch(`${baseUrl}/dishes/${createdDish.id}/image`, {
      method: "POST",
      headers,
      body: dishForm
    });
    assert.equal(imageResponse.status, 200);
    const dishWithImage = await imageResponse.json();
    assert.match(dishWithImage.imageUrl, /^\/uploads\/dishes\/.+\.webp$/);
    storedUrls.push(dishWithImage.imageUrl);

    const publicImage = await fetch(`${baseUrl}${dishWithImage.imageUrl}`);
    assert.equal(publicImage.status, 200);
    assert.match(publicImage.headers.get("content-type"), /image\/webp/);

    const menuResponse = await fetch(`${baseUrl}/restaurants/7/dishes`);
    assert.equal(menuResponse.status, 200);
    assert.equal((await menuResponse.json())[0].imageUrl, dishWithImage.imageUrl);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await Promise.all(storedUrls.map((url) => imageService.removeOptimizedImage(url)));

    prisma.user.findUnique = original.userFindUnique;
    prisma.user.update = original.userUpdate;
    prisma.restaurant.findUnique = original.restaurantFindUnique;
    prisma.restaurant.create = original.restaurantCreate;
    prisma.restaurant.findMany = original.restaurantFindMany;
    prisma.dish.findUnique = original.dishFindUnique;
    prisma.dish.create = original.dishCreate;
    prisma.dish.update = original.dishUpdate;
    prisma.dish.findMany = original.dishFindMany;

    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    if (previousEmailRecipient === undefined) delete process.env.EMAIL_NOTIFICATION_TO;
    else process.env.EMAIL_NOTIFICATION_TO = previousEmailRecipient;
  }
});
