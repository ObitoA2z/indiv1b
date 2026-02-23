const express = require('express');
const { prisma } = require('../prisma');
const { authMiddleware, requireRole } = require('../auth');

const router = express.Router();

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderProductsTable(products) {
  const rows = products.map((p) => `
    <tr>
      <td>${escapeHtml(p.id)}</td>
      <td>${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.status)}</td>
      <td>${escapeHtml(p.sellerName)}</td>
      <td>${escapeHtml(p.location)}</td>
      <td>${Number(p.price).toFixed(2)}</td>
      <td>${Number(p.shipping).toFixed(2)}</td>
      <td>${escapeHtml(new Date(p.createdAt).toISOString())}</td>
    </tr>`).join('');

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Produits API</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; background: #f7f8fb; color: #111827; }
    h1 { margin: 0 0 8px; }
    p { margin: 0 0 16px; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; position: sticky; top: 0; }
    tr:nth-child(even) td { background: #fafafa; }
    .wrap { overflow: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
    .code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
  </style>
</head>
<body>
  <h1>Produits (${products.length})</h1>
  <p>Vue HTML de <span class="code">GET /api/products</span>. Les clients API continuent a recevoir du JSON.</p>
  <div class="wrap">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Titre</th>
          <th>Statut</th>
          <th>Vendeur</th>
          <th>Lieu</th>
          <th>Prix</th>
          <th>Livraison</th>
          <th>Cree le</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

router.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    const accept = String(req.headers.accept || '').toLowerCase();
    const wantsHtml = accept.includes('text/html');
    const wantsJson = String(req.query.format || '').toLowerCase() === 'json';
    if (wantsHtml && !wantsJson) {
      return res.type('html').send(renderProductsTable(products));
    }
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

router.patch('/api/products/:id', authMiddleware, requireRole('SELLER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produit non trouve' });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = existing.sellerId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Forbidden' });
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
