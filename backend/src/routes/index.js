const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const productsRoutes = require('./products.routes');
const checkoutRoutes = require('./checkout.routes');
const ordersRoutes = require('./orders.routes');
const usersRoutes = require('./users.routes');
const adminRoutes = require('./admin.routes');
const { createUploadRouter } = require('./upload.routes');

function registerRoutes(app, { upload }) {
  app.use(healthRoutes);
  app.use(authRoutes);
  app.use(createUploadRouter(upload));
  app.use(checkoutRoutes);
  app.use(ordersRoutes);
  app.use(productsRoutes);
  app.use(usersRoutes);
  app.use(adminRoutes);
}

module.exports = { registerRoutes };
