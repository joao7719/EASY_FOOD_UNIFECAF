const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const authRoutes = require("../src/modules/auth/auth.routes");

test("cadastro e login sem corpo retornam 400 sem acessar o banco", async (t) => {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}/auth`;
  for (const route of ["register", "login"]) {
    const response = await fetch(`${baseUrl}/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }
});
