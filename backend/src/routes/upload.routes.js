const express = require('express');

function createUploadRouter(upload) {
  const router = express.Router();

  router.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoye' });
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.status(201).json({ url });
  });

  return router;
}

module.exports = { createUploadRouter };
