const restaurantService = require("./restaurant.service");

async function list(req, res) {
  try {
    const restaurants = await restaurantService.listRestaurants();
    return res.json(restaurants);
  } catch (error) {
    console.error("Erro ao listar restaurantes:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req, res) {
  const { name, category, rating } = req.body || {};
  if (!name || !category) {
    return res.status(400).json({
      error: "Nome e categoria são obrigatórios"
    });
  }

  if (rating !== undefined && (!Number.isFinite(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
    return res.status(400).json({ error: "A avaliação deve estar entre 0 e 5" });
  }

  try {
    const restaurant = await restaurantService.createRestaurant({
      name,
      category,
      rating
    });
    return res.status(201).json(restaurant);
  } catch (error) {
    console.error("Erro ao cadastrar restaurante:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remove(req, res) {
  try {
    const restaurant = await restaurantService.deleteRestaurant(req.params.id);
    return res.json({
      message: "Restaurante deletado com sucesso",
      restaurant
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { list, create, remove };
