const express = require('express');
const OrderController = require('../controllers/OrderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET - Obter todos os pedidos do usuário logado
router.get('/my-orders', authenticateToken, OrderController.getUserOrders);

// GET - Obter detalhes de um pedido específico pelo ID
// Params: id (do pedido)
router.get('/:id', authenticateToken, OrderController.getOrder);

// GET - Listar todos os pedidos (apenas admin) com filtros opcionais
// Query params: ?status=pending&limit=10&page=1
router.get('/', authenticateToken, requireAdmin, OrderController.getAllOrders);

// POST - Criar um novo pedido a partir do carrinho
// Body: { shipping_address: string, notes?: string, payment_method?: string }
router.post('/', authenticateToken, OrderController.createOrder);

// PATCH - Atualizar o status de um pedido
// Params: id (do pedido)
// Body: { status: string }
router.patch('/:id/status', authenticateToken, OrderController.updateOrderStatus);

// GET - Obter resumo/estatísticas de pedidos (apenas admin)
router.get('/admin/summary', authenticateToken, requireAdmin, OrderController.getOrdersSummary);

// NOVA ROTA - Obter estatísticas detalhadas para dashboard (apenas admin)
router.get('/admin/dashboard-stats', authenticateToken, requireAdmin, OrderController.getDashboardStats);

module.exports = router;