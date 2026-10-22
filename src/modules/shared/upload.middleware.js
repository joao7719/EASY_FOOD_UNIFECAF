const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Formato de imagem não permitido"));
    }
    return callback(null, true);
  }
});

function uploadDishImage(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      return res.status(tooLarge ? 413 : 400).json({
        error: tooLarge
          ? "A imagem excede o limite de 5 MB"
          : "Não foi possível receber a imagem"
      });
    }

    return res.status(400).json({
      error: error.message || "Formato de imagem não permitido"
    });
  });
}

module.exports = { uploadDishImage };
