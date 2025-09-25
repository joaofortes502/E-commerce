const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas 

// GET Listar todos os produtos com filtros opcionais
// Suporta parâmetros: ?category=Eletrônicos&inStock=true&page=1&limit=10
router.get('/', ProductController.index);

// GET Buscar um produto específico por ID
router.get('/:id', ProductController.show);

// GET Buscar produtos por categoria específica
router.get('/category/:category', ProductController.byCategory);

// GET Verificar disponibilidade de estoque
// Suporta parâmetro: ?quantity=2
router.get('/:id/stock', ProductController.checkStock);

// Rotas protegidas 

// POST Criar um novo produto
router.post('/', authenticateToken, requireAdmin, ProductController.store);

// PUT Atualizar um produto existente
router.put('/:id', authenticateToken, requireAdmin, ProductController.update);

// DELETE Deletar (desativar) um produto
router.delete('/:id', authenticateToken, requireAdmin, ProductController.destroy);

module.exports = router;