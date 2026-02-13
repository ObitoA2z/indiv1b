const express = require('express');
const { prisma } = require('../prisma');
const { authMiddleware } = require('../auth');

const router = express.Router();

async function upsertSellerRequest(userId, message) {
  const existing = await prisma.sellerRequest.findUnique({ where: { userId } });
  return existing
    ? prisma.sellerRequest.update({ where: { userId }, data: { status: 'pending', message } })
    : prisma.sellerRequest.create({ data: { userId, status: 'pending', message } });
}

router.post('/api/users/me/request-seller', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const message = req.body?.message || null;

    const reqRecord = await upsertSellerRequest(userId, message);

    return res.status(201).json(reqRecord);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Impossible d'enregistrer la demande vendeur" });
  }
});

// Backward-compatibility endpoint kept for frontend clients still calling this route.
router.post('/api/users/me/upgrade-to-seller', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const message = req.body?.message || null;
    const reqRecord = await upsertSellerRequest(userId, message);
    return res.status(201).json(reqRecord);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Impossible d'enregistrer la demande vendeur" });
  }
});

router.get('/api/users/me/seller-request', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const reqRecord = await prisma.sellerRequest.findUnique({ where: { userId } });
    return res.json(reqRecord || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Impossible de charger la demande vendeur' });
  }
});

module.exports = router;
