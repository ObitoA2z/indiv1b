const express = require('express');
const { prisma } = require('../prisma');
const { authMiddleware } = require('../auth');
const rabbitmq = require('../services/rabbitmq');

const router = express.Router();

router.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId requis' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }

    const totalPrice = (product.price + product.shipping) * quantity;

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        buyerId: req.user.id,
        totalPrice,
        status: 'pending',
      },
    });

    await rabbitmq.publish('order.created', {
      orderId: order.id,
      productId: product.id,
      productTitle: product.title,
      buyerId: req.user.id,
      buyerEmail: req.user.email,
      totalPrice,
      quantity,
      createdAt: order.createdAt.toISOString(),
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors de la creation de la commande' });
  }
});

router.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors du chargement des commandes' });
  }
});

module.exports = router;
