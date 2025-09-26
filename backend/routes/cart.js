const express = require('express');
const CartController = require('../controllers/CartController');
const { authenticateToken, optionalAuthForCart } = require('../middleware/auth');

const router = express.Router();

// GET todos os itens do carrinho atual
router.get('/', optionalAuthForCart, CartController.getCart);

// GET resumo rápido do carrinho (UI)
router.get('/summary', optionalAuthForCart, CartController.getCartSummary);

// POST adicionar um produto ao carrinho
// Body: { product_id: number, quantity: number }
// Header opcional: X-Session-Id para usuários anônimos
router.post('/items', optionalAuthForCart, CartController.addItem);

// PUT Atualizar quantidade de um item específico
// Params: id = product_id
// Body: { quantity: number }
router.put('/items/:id', optionalAuthForCart, CartController.updateItem);

// DELETE Remover um item específico do carrinho
// Params: id = product_id
router.delete('/items/:id', optionalAuthForCart, CartController.removeItem);

// DELETE Limpar todo o carrinho
router.delete('/', optionalAuthForCart, CartController.clearCart);

// POST migrar carrinho de sessão anônima para usuário logado
// Body: { session_id: string }
// Requer autenticação (usuário deve estar logado)
router.post('/migrate', authenticateToken, CartController.migrateCart);

module.exports = router;