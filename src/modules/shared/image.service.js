const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");

const uploadsDirectory = path.resolve(process.cwd(), "uploads", "dishes");

async function optimizeImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const error = new Error("Arquivo de imagem inválido ou vazio");
    error.statusCode = 400;
    throw error;
  }

  const filename = `${crypto.randomUUID()}.webp`;
  await fs.mkdir(uploadsDirectory, { recursive: true });
  const filePath = path.join(uploadsDirectory, filename);

  try {
    await sharp(buffer, { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);
  } catch (cause) {
    const error = new Error("Arquivo de imagem inválido ou corrompido");
    error.statusCode = 400;
    error.cause = cause;
    throw error;
  }

  return `/uploads/dishes/${filename}`;
}

async function removeOptimizedImage(imageUrl) {
  const prefix = "/uploads/dishes/";
  if (typeof imageUrl !== "string" || !imageUrl.startsWith(prefix)) return;

  const filename = imageUrl.slice(prefix.length);
  if (!/^[a-f0-9-]+\.webp$/i.test(filename)) return;

  const filePath = path.resolve(uploadsDirectory, filename);
  if (path.dirname(filePath) !== uploadsDirectory) return;
  await fs.unlink(filePath).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}

module.exports = { optimizeImage, removeOptimizedImage };
