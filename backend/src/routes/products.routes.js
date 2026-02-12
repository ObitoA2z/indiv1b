const express = require('express');
const { prisma } = require('../prisma');
const { authMiddleware, requireRole } = require('../auth');

const router = express.Router();

router.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors du chargement des produits' });
  }
});

router.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors du chargement du produit' });
  }
});

router.post('/api/products', authMiddleware, requireRole('SELLER', 'ADMIN'), async (req, res) => {
  try {
    const { title, description, price, shipping, category, images, location } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const sellerId = req.user.id;
    const sellerName = req.user.name || req.user.email;

    const id = req.body.id || Date.now().toString();
    const image = Array.isArray(images) && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&w=800&q=80';

    await prisma.category.upsert({
      where: { id: category },
      update: {},
      create: { id: category, name: category },
    });

    const now = new Date();
    const createdProduct = await prisma.product.create({
      data: {
        id,
        title,
        description,
        price: Number(price),
        shipping: Number(shipping ?? 0),
        image,
        images: Array.isArray(images) && images.length > 0 ? images : [image],
        categoryId: category,
        sellerId,
        sellerName,
        sellerRating: 5.0,
        sellerReviews: 0,
        location: location || 'France',
        status: 'pending',
        createdAt: now,
        priceHistory: [{ price: Number(price), date: now.toISOString().slice(0, 10) }],
      },
    });

    return res.status(201).json(createdProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de la creation de l'article" });
  }
});

router.patch('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
        price: data.price !== undefined ? Number(data.price) : existing.price,
        shipping: data.shipping !== undefined ? Number(data.shipping) : existing.shipping,
        status: data.status ?? existing.status,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors de la mise a jour du produit' });
  }
});

module.exports = router;
