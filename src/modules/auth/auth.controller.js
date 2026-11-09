const authService = require("./auth.service");

async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Nome, e-mail e senha são obrigatórios"
    });
  }

  try {
    const user = await authService.register({ name, email, password });
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    console.error("Erro ao cadastrar usuário:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    const result = await authService.login({ email, password });
    if (!result) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    return res.json(result);
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);
    return res.json({ message: "Você está autenticado!", user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro interno do servidor"
    });
  }
}

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  }

  try {
    const user = await authService.uploadProfileImage(req.user.id, req.file.buffer);
    return res.json({ user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro ao processar imagem"
    });
  }
}

module.exports = { register, login, me, uploadImage };
