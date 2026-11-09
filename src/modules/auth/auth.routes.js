const express = require("express");
const controller = require("./auth.controller");
const authenticate = require("./auth.middleware");
const { uploadImage } = require("../shared/upload.middleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.me);
router.post("/me/image", authenticate, uploadImage, controller.uploadImage);

module.exports = router;
