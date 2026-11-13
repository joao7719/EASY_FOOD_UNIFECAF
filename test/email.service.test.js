const test = require("node:test");
const assert = require("node:assert/strict");
const prisma = require("../src/database/prisma");
const emailService = require("../src/modules/shared/email.service");
const restaurantService = require("../src/modules/restaurants/restaurant.service");

function saveEnvironment(names) {
  return Object.fromEntries(names.map((name) => [name, process.env[name]]));
}

function restoreEnvironment(values) {
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

test("email.service monta o corpo HTML padrão", () => {
  const html = emailService.buildHtml({
    header: "Novo restaurante",
    body: "Categoria: Italiana",
    footer: "Equipe EasyFood"
  });
  assert.match(html, /<h2>Novo restaurante<\/h2>/);
  assert.match(html, /Categoria: Italiana/);
  assert.match(html, /Equipe EasyFood/);
});

test("sendEmail usa modo simulado sem chave e não chama a rede", async () => {
  const environment = saveEnvironment(["EMAIL_API_KEY"]);
  const originalFetch = global.fetch;
  delete process.env.EMAIL_API_KEY;
  global.fetch = async () => {
    throw new Error("fetch não deveria ser chamado no modo simulado");
  };
  try {
    const result = await emailService.sendEmail({
      to: "teste@example.com",
      toName: "Teste",
      subject: "Teste local",
      header: "Olá",
      body: "Mensagem",
      footer: "EasyFood"
    });
    assert.equal(result.simulated, true);
    assert.equal(result.to, "teste@example.com");
  } finally {
    global.fetch = originalFetch;
    restoreEnvironment(environment);
  }
});

test("sendEmail envia o contrato esperado à API configurada", async () => {
  const environment = saveEnvironment(["EMAIL_API_KEY", "EMAIL_API_URL", "EMAIL_FROM"]);
  const originalFetch = global.fetch;
  let request;
  process.env.EMAIL_API_KEY = "test-only-key";
  process.env.EMAIL_API_URL = "https://email.example.test/messages";
  process.env.EMAIL_FROM = "EasyFood <no-reply@example.test>";
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ id: "test-message-id" }) };
  };
  try {
    const result = await emailService.sendEmail({
      to: "destinatario@example.test",
      toName: "Cantina",
      subject: "Bem-vindo",
      header: "Olá, Cantina",
      body: "Cadastro concluído",
      footer: "Equipe EasyFood"
    });
    assert.deepEqual(result, { id: "test-message-id" });
    assert.equal(request.url, process.env.EMAIL_API_URL);
    assert.equal(request.options.headers.Authorization, "Bearer test-only-key");
    const body = JSON.parse(request.options.body);
    assert.deepEqual(body.to, ["destinatario@example.test"]);
    assert.equal(body.from, process.env.EMAIL_FROM);
    assert.equal(body.subject, "Bem-vindo");
    assert.match(body.html, /Olá, Cantina/);
  } finally {
    global.fetch = originalFetch;
    restoreEnvironment(environment);
  }
});

test("falhas de e-mail não desfazem o cadastro do restaurante", async () => {
  const environment = saveEnvironment([
    "EMAIL_API_KEY",
    "EMAIL_API_URL",
    "EMAIL_FROM",
    "EMAIL_NOTIFICATION_TO"
  ]);
  const originalFetch = global.fetch;
  const originalCreate = prisma.restaurant.create;
  let createCalls = 0;
  let emailCalls = 0;
  const savedRestaurant = {
    id: 731,
    name: "Cantina de Teste",
    category: "Italiana",
    rating: 4.5,
    imageUrl: null
  };
  process.env.EMAIL_API_KEY = "test-only-key";
  process.env.EMAIL_API_URL = "https://email.example.test/messages";
  process.env.EMAIL_FROM = "EasyFood <no-reply@example.test>";
  process.env.EMAIL_NOTIFICATION_TO = "destinatario@example.test";
  prisma.restaurant.create = async () => {
    createCalls += 1;
    return savedRestaurant;
  };
  global.fetch = async () => {
    emailCalls += 1;
    return { ok: false, status: 503, text: async () => "serviço temporariamente indisponível" };
  };
  try {
    const result = await restaurantService.createRestaurant({
      name: "Cantina de Teste",
      category: "Italiana",
      rating: 4.5
    });
    assert.equal(result.id, savedRestaurant.id);
    assert.equal(createCalls, 1);
    assert.equal(emailCalls, 2);
  } finally {
    global.fetch = originalFetch;
    prisma.restaurant.create = originalCreate;
    restoreEnvironment(environment);
  }
});
