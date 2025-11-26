const express = require('express');
const SupplierController = require('../controllers/SupplierController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas

// GET - Listar todos os fornecedores com filtros opcionais
// Query params: ?status=active&category=Eletrônicos&search=tech&page=1&limit=10
router.get('/', SupplierController.index);

// GET - Buscar um fornecedor específico por ID
router.get('/:id', SupplierController.show);

// GET - Buscar produtos de um fornecedor específico
router.get('/:id/products', SupplierController.getSupplierProducts);

// Rotas protegidas (apenas admin)

// POST - Criar um novo fornecedor
// Body: { name, contact_name, email, phone, address, city, state, zip_code, country, cnpj, category, notes }
router.post('/', authenticateToken, requireAdmin, SupplierController.store);

// PUT - Atualizar um fornecedor existente
router.put('/:id', authenticateToken, requireAdmin, SupplierController.update);

// DELETE - Excluir um fornecedor (apenas se não tiver produtos associados)
router.delete('/:id', authenticateToken, requireAdmin, SupplierController.destroy);

// PATCH - Desativar um fornecedor (soft delete)
router.patch('/:id/deactivate', authenticateToken, requireAdmin, SupplierController.deactivate);

// GET - Obter estatísticas de um fornecedor específico
router.get('/:id/stats', authenticateToken, requireAdmin, SupplierController.getSupplierStats);

// GET - Obter estatísticas gerais de todos os fornecedores
router.get('/admin/summary/stats', authenticateToken, requireAdmin, SupplierController.getAllSuppliersStats);

module.exports = router;