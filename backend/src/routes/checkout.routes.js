const express = require('express');
const { prisma } = require('../prisma');
const { authMiddleware } = require('../auth');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const router = express.Router();

router.post('/api/checkout/session', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe n'est pas configure cote serveur" });
    }

    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId est requis' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'available') {
      return res.status(400).json({ error: 'Produit indisponible pour le paiement' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: product.description.slice(0, 200),
              images: [product.image],
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: quantity && Number(quantity) > 0 ? Number(quantity) : 1,
        },
      ],
      success_url: `${frontendUrl}/?payment=success&productId=${product.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?payment=cancel&productId=${product.id}`,
      metadata: {
        productId: product.id,
        buyerId: req.user.id,
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors de la creation de la session de paiement' });
  }
});

module.exports = router;
