const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Formato de imagem não permitido"));
    }
    return callback(null, true);
  }
});

function handleUpload(req, res, next, { required = true } = {}) {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      if (required && !req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      return next();
    }

    if (error instanceof multer.MulterError) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        error: error.code === "LIMIT_FILE_SIZE"
          ? "A imagem excede o limite de 5 MB"
          : "Não foi possível receber a imagem"
      });
    }

    return res.status(400).json({
      error: error.message || "Formato de imagem não permitido"
    });
  });
}

function uploadImage(req, res, next) {
  return handleUpload(req, res, next);
}

function uploadOptionalImage(req, res, next) {
  return handleUpload(req, res, next, { required: false });
}

module.exports = {
  uploadImage,
  uploadDishImage: uploadImage,
  uploadOptionalImage
};
