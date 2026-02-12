const express = require('express');
const { prisma } = require('../prisma');
const { authMiddleware, requireRole } = require('../auth');
const { serializeUser } = require('../utils/serializeUser');

const router = express.Router();

router.post('/api/admin/products/:id/approve', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }

    const updated = await prisma.product.update({ where: { id }, data: { status: 'available' } });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de l'approbation du produit" });
  }
});

router.post('/api/admin/products/:id/reject', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }

    const updated = await prisma.product.update({ where: { id }, data: { status: 'rejected' } });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors du rejet du produit' });
  }
});

router.delete('/api/admin/products/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de la suppression de l'article" });
  }
});

router.get('/api/admin/seller-requests', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const status = (req.query.status || 'pending').toString();
    const list = await prisma.sellerRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Impossible de lister les demandes vendeur' });
  }
});

router.post('/api/admin/seller-requests/:id/approve', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id;
    const request = await prisma.sellerRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable' });
    }

    await prisma.$transaction([
      prisma.sellerRequest.update({ where: { id }, data: { status: 'approved' } }),
      prisma.user.update({ where: { id: request.userId }, data: { role: 'SELLER', active: true } }),
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Impossible d'approuver la demande" });
  }
});

router.post('/api/admin/seller-requests/:id/reject', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id;
    const message = req.body?.message || null;
    const request = await prisma.sellerRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable' });
    }

    await prisma.sellerRequest.update({ where: { id }, data: { status: 'rejected', message } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Impossible de rejeter la demande' });
  }
});

router.get('/api/admin/users', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const role = req.query.role ? String(req.query.role) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;
    const page = Number(req.query.page || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));

    const where = {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);

    return res.json({
      total,
      page,
      pageSize,
      items: users.map(serializeUser),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Impossible de lister les utilisateurs' });
  }
});

router.post('/api/admin/users/:id/active', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id;
    const active = Boolean(req.body?.active);
    const user = await prisma.user.update({ where: { id }, data: { active } });
    return res.json(serializeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Impossible de mettre a jour l'etat du compte" });
  }
});

router.post('/api/admin/users/:id/role', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.body?.role;
    if (!['BUYER', 'SELLER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Role invalide' });
    }

    const user = await prisma.user.update({ where: { id }, data: { role } });
    return res.json(serializeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Impossible de mettre a jour le role" });
  }
});

module.exports = router;
