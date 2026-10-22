const express = require("express");
const controller = require("./restaurant.controller");
const authMiddleware = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", controller.list);
router.post("/", authMiddleware, controller.create);
router.delete("/:id", authMiddleware, controller.remove);

module.exports = router;
