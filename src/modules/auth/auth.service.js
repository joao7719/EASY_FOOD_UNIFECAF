const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseUserId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw httpError("ID do usuário inválido", 400);
  }
  return id;
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }
  return process.env.JWT_SECRET;
}

async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true
    }
  });
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl
    }
  };
}

async function getUserById(userId) {
  const id = parseUserId(userId);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, imageUrl: true }
  });
  if (!user) throw httpError("Usuário não encontrado", 404);
  return user;
}

async function uploadProfileImage(userId, buffer) {
  const id = parseUserId(userId);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, imageUrl: true }
  });
  if (!user) throw httpError("Usuário não encontrado", 404);

  const imageUrl = await imageService.optimizeImage(buffer, "profiles");
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { imageUrl },
      select: { id: true, name: true, email: true, imageUrl: true }
    });
    if (user.imageUrl) {
      await imageService.removeOptimizedImage(user.imageUrl).catch(() => {});
    }
    return updatedUser;
  } catch (error) {
    await imageService.removeOptimizedImage(imageUrl).catch(() => {});
    throw error;
  }
}

module.exports = { register, login, getUserById, uploadProfileImage };
