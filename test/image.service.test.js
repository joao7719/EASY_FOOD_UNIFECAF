const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const imageService = require("../src/modules/shared/image.service");

test("otimiza a imagem para WebP e limita a largura a 800 px", async () => {
  const width = 1200;
  const height = 900;
  const raw = Buffer.alloc(width * height * 3);
  let seed = 0x12345678;
  for (let i = 0; i < raw.length; i += 1) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    raw[i] = seed & 0xff;
  }

  const original = await sharp(raw, {
    raw: { width, height, channels: 3 }
  }).png().toBuffer();
  let imageUrl;

  try {
    imageUrl = await imageService.optimizeImage(original);
    const filePath = path.resolve(process.cwd(), "uploads", imageUrl.replace(/^\/uploads\//, ""));
    const metadata = await sharp(filePath).metadata();
    const optimizedSize = (await fs.stat(filePath)).size;

    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 800);
    assert.equal(metadata.height, 600);
    assert.ok(optimizedSize < original.length);
    console.log(`Comparação de teste: PNG ${original.length} bytes -> WebP ${optimizedSize} bytes; 1200x900 -> 800x600`);
  } finally {
    if (imageUrl) await imageService.removeOptimizedImage(imageUrl);
  }
});

test("rejeita dados que não podem ser decodificados como imagem", async () => {
  await assert.rejects(
    imageService.optimizeImage(Buffer.from("isto não é uma imagem")),
    (error) => error.statusCode === 400 && /imagem inválido ou corrompido/.test(error.message)
  );
});
