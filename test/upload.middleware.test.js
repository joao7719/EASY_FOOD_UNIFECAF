const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../src/modules/auth/auth.middleware");
const { uploadDishImage } = require("../src/modules/shared/upload.middleware");

process.env.JWT_SECRET = "easyfood-test-secret";

test("middleware exige JWT e trata ausência, formato e tamanho de imagem", async (t) => {
  const app = express();
  app.post("/dishes/:dishId/image", authMiddleware, uploadDishImage, (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });
    return res.json({ received: true });
  });
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const url = `${baseUrl}/dishes/1/image`;
  const token = jwt.sign({ id: 1, email: "teste@easyfood.local" }, process.env.JWT_SECRET);
  const headers = { Authorization: `Bearer ${token}` };

  const unauthorized = await fetch(url, { method: "POST", body: new FormData() });
  assert.equal(unauthorized.status, 401);

  const missing = await fetch(url, { method: "POST", headers, body: new FormData() });
  assert.equal(missing.status, 400);
  assert.deepEqual(await missing.json(), { error: "Nenhuma imagem enviada" });

  const invalidForm = new FormData();
  invalidForm.append("image", new Blob(["texto"], { type: "text/plain" }), "arquivo.txt");
  const invalid = await fetch(url, { method: "POST", headers, body: invalidForm });
  assert.equal(invalid.status, 400);

  const largeForm = new FormData();
  largeForm.append("image", new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" }), "grande.png");
  const large = await fetch(url, { method: "POST", headers, body: largeForm });
  assert.equal(large.status, 413);
});
