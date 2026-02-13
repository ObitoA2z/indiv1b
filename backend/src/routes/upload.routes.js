const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { authMiddleware, requireRole } = require('../auth');

function createUploadRouter(upload) {
  const router = express.Router();
  const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Trop d'uploads, reessayez plus tard." },
  });

  router.post(
    '/api/upload',
    authMiddleware,
    requireRole('SELLER', 'ADMIN'),
    uploadLimiter,
    (req, res) => {
      upload.single('image')(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'Fichier trop volumineux (max 5MB par defaut)' });
          }
          if (err.message === 'UNSUPPORTED_FILE_TYPE') {
            return res.status(400).json({ error: "Type de fichier non autorise (jpeg/png/webp/gif)" });
          }
          return res.status(400).json({ error: "Erreur lors de l'upload de l'image" });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'Aucun fichier envoye' });
        }

        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.status(201).json({ url });
      });
    }
  );

  return router;
}

module.exports = { createUploadRouter };
