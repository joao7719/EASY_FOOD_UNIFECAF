const express = require("express");
const dishController = require("./dish.controller");
const authenticate = require("../auth/auth.middleware");
const { uploadDishImage } = require("../shared/upload.middleware");

const router = express.Router();

router.get("/restaurants/:restaurantId/dishes", dishController.list);
router.post(
  "/restaurants/:restaurantId/dishes",
  authenticate,
  dishController.create
);
router.post(
  "/dishes/:dishId/image",
  authenticate,
  uploadDishImage,
  dishController.uploadImage
);

module.exports = router;
