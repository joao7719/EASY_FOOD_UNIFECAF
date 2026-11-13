const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

test("dashboard publica a interface de cadastro e imagem de pratos", async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const pageResponse = await fetch(baseUrl);
  assert.equal(pageResponse.status, 200);
  const page = await pageResponse.text();
  assert.match(page, /data-tab="dishes"/);
  assert.match(page, /id="dish-form"/);
  assert.match(page, /id="dish-image"/);

  const scriptResponse = await fetch(`${baseUrl}/script.js`);
  assert.equal(scriptResponse.status, 200);
  const script = await scriptResponse.text();
  assert.match(script, /restaurants\/\$\{restaurantId\}\/dishes/);
  assert.match(script, /dishes\/\$\{dish\.id\}\/image/);
  assert.match(script, /dish-image-upload/);
});
