const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");

const uploadDirectories = {
  profiles: path.resolve(process.cwd(), "uploads", "profiles"),
  dishes: path.resolve(process.cwd(), "uploads", "dishes"),
  restaurants: path.resolve(process.cwd(), "uploads", "restaurants")
};
const supportedFormats = new Set(["jpeg", "png", "webp"]);

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function optimizeImage(buffer, ownerType = "dishes") {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw httpError("Arquivo de imagem inválido ou vazio", 400);
  }

  const uploadsDirectory = uploadDirectories[ownerType];
  if (!uploadsDirectory) {
    throw httpError("Tipo de imagem não permitido", 400);
  }

  let metadata;
  try {
    metadata = await sharp(buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000
    }).metadata();
  } catch (cause) {
    const error = httpError("Arquivo de imagem inválido ou corrompido", 400);
    error.cause = cause;
    throw error;
  }

  if (!supportedFormats.has(metadata.format)) {
    throw httpError("Formato de imagem não permitido; use JPEG, PNG ou WebP", 400);
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const filePath = path.join(uploadsDirectory, filename);
  await fs.mkdir(uploadsDirectory, { recursive: true });

  try {
    await sharp(buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000
    })
      .rotate()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);
  } catch (cause) {
    await fs.unlink(filePath).catch(() => {});
    const error = httpError("Arquivo de imagem inválido ou corrompido", 400);
    error.cause = cause;
    throw error;
  }

  return `/uploads/${ownerType}/${filename}`;
}

async function removeOptimizedImage(imageUrl) {
  if (typeof imageUrl !== "string") return;

  const match = /^\/uploads\/(profiles|dishes|restaurants)\/([a-f0-9-]+\.webp)$/i.exec(imageUrl);
  if (!match) return;

  const [, ownerType, filename] = match;
  const directory = uploadDirectories[ownerType];
  const filePath = path.resolve(directory, filename);
  if (path.dirname(filePath) !== directory) return;

  await fs.unlink(filePath).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}

module.exports = { optimizeImage, removeOptimizedImage };
