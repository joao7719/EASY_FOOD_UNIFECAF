const express = require("express");
const cors = require("cors");
const path = require("path");

const restaurantRoutes = require("./modules/restaurants/restaurant.routes");
const authRoutes = require("./modules/auth/auth.routes");
const dishRoutes = require("./modules/dishes/dish.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/restaurants", restaurantRoutes);
app.use("/auth", authRoutes);
app.use(dishRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Corpo JSON inválido" });
  }

  console.error("Erro não tratado na API:", error.message);
  return res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : "Erro interno do servidor"
  });
});

module.exports = app;
