const request = require('supertest');
const express = require('express');
const SupplierController = require('../controllers/SupplierController');
const TestDatabase = require('../tests/testSetup');

// Mock do middleware de autenticação
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, type: 'admin' };
    next();
  },
  requireAdmin: (req, res, next) => {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    next();
  }
}));

// Mock do modelo Supplier
jest.mock('../models/Supplier', () => {
  const mockSuppliers = [
    {
      id: 1,
      name: 'Fornecedor Teste',
      contact_name: 'João Silva',
      email: 'joao@test.com',
      phone: '(11) 9999-9999',
      category: 'Eletrônicos',
      status: 'active'
    },
    {
      id: 2,
      name: 'Fornecedor Inativo',
      contact_name: 'Maria Santos',
      email: 'maria@test.com',
      status: 'inactive'
    }
  ];

  return {
    findAll: jest.fn().mockImplementation((options = {}) => {
      let filtered = mockSuppliers;
      if (options.status) {
        filtered = filtered.filter(s => s.status === options.status);
      }
      return Promise.resolve(filtered);
    }),

    findById: jest.fn().mockImplementation((id) => {
      const supplier = mockSuppliers.find(s => s.id === id);
      if (!supplier) {
        throw new Error('Fornecedor não encontrado');
      }
      return Promise.resolve(supplier);
    }),

    create: jest.fn().mockImplementation((supplierData) => {
      const newSupplier = {
        id: 3,
        ...supplierData,
        status: 'active'
      };
      mockSuppliers.push(newSupplier);
      return Promise.resolve(newSupplier);
    }),

    update: jest.fn().mockImplementation((id, updateData) => {
      const supplierIndex = mockSuppliers.findIndex(s => s.id === id);
      if (supplierIndex === -1) {
        throw new Error('Fornecedor não encontrado');
      }
      mockSuppliers[supplierIndex] = { ...mockSuppliers[supplierIndex], ...updateData };
      return Promise.resolve({ message: 'Fornecedor atualizado com sucesso' });
    }),

    delete: jest.fn().mockImplementation((id) => {
      const supplierIndex = mockSuppliers.findIndex(s => s.id === id);
      if (supplierIndex === -1) {
        throw new Error('Fornecedor não encontrado');
      }
      
      // Simula verificação de produtos associados
      if (id === 1) {
        throw new Error('Não é possível excluir o fornecedor pois existem produtos associados a ele');
      }
      
      mockSuppliers.splice(supplierIndex, 1);
      return Promise.resolve({ message: 'Fornecedor excluído com sucesso' });
    }),

    deactivate: jest.fn().mockImplementation((id) => {
      const supplier = mockSuppliers.find(s => s.id === id);
      if (!supplier) {
        throw new Error('Fornecedor não encontrado');
      }
      supplier.status = 'inactive';
      return Promise.resolve({ message: 'Fornecedor desativado com sucesso' });
    }),

    getProducts: jest.fn().mockImplementation((supplierId) => {
      if (supplierId === 1) {
        return Promise.resolve([{ id: 1, name: 'Produto Teste', price: 100.00 }]);
      }
      return Promise.resolve([]);
    }),

    getStats: jest.fn().mockImplementation((supplierId) => {
      if (supplierId === 1) {
        return Promise.resolve({ total_products: 1, total_stock: 10, stock_value: 1000 });
      }
      return Promise.resolve({ total_products: 0, total_stock: 0, stock_value: 0 });
    })
  };
});

// Configuração do app Express para testes
const app = express();
app.use(express.json());

// Rotas
app.get('/api/suppliers', SupplierController.index);
app.get('/api/suppliers/:id', SupplierController.show);
app.get('/api/suppliers/:id/products', SupplierController.getSupplierProducts);
app.get('/api/suppliers/:id/stats', SupplierController.getSupplierStats);
app.post('/api/suppliers', SupplierController.store);
app.put('/api/suppliers/:id', SupplierController.update);
app.delete('/api/suppliers/:id', SupplierController.destroy);
app.patch('/api/suppliers/:id/deactivate', SupplierController.deactivate);

describe('Supplier Controller', () => {
  beforeAll(async () => {
    await TestDatabase.initializeTestDatabase();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/suppliers', () => {
    it('deve retornar todos os fornecedores', async () => {
      const response = await request(app)
        .get('/api/suppliers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.suppliers).toHaveLength(2);
      expect(response.body.suppliers[0].name).toBe('Fornecedor Teste');
    });

    it('deve filtrar fornecedores por status', async () => {
      const response = await request(app)
        .get('/api/suppliers?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.suppliers).toHaveLength(1);
      expect(response.body.suppliers[0].status).toBe('active');
    });

    it('deve retornar lista vazia quando não há fornecedores', async () => {
      // Mock para retornar array vazio
      const Supplier = require('../models/Supplier');
      Supplier.findAll.mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/suppliers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.suppliers).toHaveLength(0);
    });
  });

  describe('GET /api/suppliers/:id', () => {
    it('deve retornar um fornecedor específico', async () => {
      const response = await request(app)
        .get('/api/suppliers/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.supplier.id).toBe(1);
      expect(response.body.supplier.name).toBe('Fornecedor Teste');
    });

    it('deve retornar erro 404 para fornecedor não encontrado', async () => {
      const Supplier = require('../models/Supplier');
      Supplier.findById.mockRejectedValueOnce(new Error('Fornecedor não encontrado'));

      const response = await request(app)
        .get('/api/suppliers/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('não encontrado');
    });

    it('deve retornar erro 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/suppliers/abc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inválido');
    });
  });

  describe('POST /api/suppliers', () => {
    it('deve criar um novo fornecedor', async () => {
      const newSupplier = {
        name: 'Novo Fornecedor',
        contact_name: 'Carlos Oliveira',
        email: 'carlos@novo.com',
        phone: '(11) 8888-8888',
        category: 'Roupas'
      };

      const response = await request(app)
        .post('/api/suppliers')
        .send(newSupplier)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('criado com sucesso');
      expect(response.body.supplier.name).toBe(newSupplier.name);
    });

    it('deve retornar erro 400 quando nome está vazio', async () => {
      const invalidSupplier = {
        name: '',
        contact_name: 'Teste'
      };

      const response = await request(app)
        .post('/api/suppliers')
        .send(invalidSupplier)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('obrigatório');
    });

  });

  describe('PUT /api/suppliers/:id', () => {
    it('deve atualizar um fornecedor existente', async () => {
      const updateData = {
        name: 'Fornecedor Atualizado',
        contact_name: 'Novo Contato'
      };

      const response = await request(app)
        .put('/api/suppliers/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('atualizado com sucesso');
    });

    it('deve retornar erro 404 para fornecedor não encontrado na atualização', async () => {
      const Supplier = require('../models/Supplier');
      Supplier.update.mockRejectedValueOnce(new Error('Fornecedor não encontrado'));

      const response = await request(app)
        .put('/api/suppliers/999')
        .send({ name: 'Teste' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 quando nome fica vazio na atualização', async () => {
      const response = await request(app)
        .put('/api/suppliers/1')
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('não pode estar vazio');
    });
  });

  describe('DELETE /api/suppliers/:id', () => {
    it('deve deletar um fornecedor sem produtos associados', async () => {
      const response = await request(app)
        .delete('/api/suppliers/2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('excluído com sucesso');
    });

    it('deve retornar erro 409 quando há produtos associados', async () => {
      const response = await request(app)
        .delete('/api/suppliers/1')
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('produtos associados');
    });

    it('deve retornar erro 404 para fornecedor não encontrado na exclusão', async () => {
      const Supplier = require('../models/Supplier');
      Supplier.delete.mockRejectedValueOnce(new Error('Fornecedor não encontrado'));

      const response = await request(app)
        .delete('/api/suppliers/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/suppliers/:id/deactivate', () => {
    it('deve desativar um fornecedor', async () => {
      const response = await request(app)
        .patch('/api/suppliers/1/deactivate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('desativado com sucesso');
    });

    it('deve retornar erro 404 para fornecedor não encontrado na desativação', async () => {
      const Supplier = require('../models/Supplier');
      Supplier.deactivate.mockRejectedValueOnce(new Error('Fornecedor não encontrado'));

      const response = await request(app)
        .patch('/api/suppliers/999/deactivate')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/suppliers/:id/products', () => {
    it('deve retornar produtos do fornecedor', async () => {
      const response = await request(app)
        .get('/api/suppliers/1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.supplier_id).toBe(1);
    });

    it('deve retornar lista vazia para fornecedor sem produtos', async () => {
      const response = await request(app)
        .get('/api/suppliers/2/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(0);
    });
  });

  describe('GET /api/suppliers/:id/stats', () => {
    it('deve retornar estatísticas do fornecedor', async () => {
      const response = await request(app)
        .get('/api/suppliers/1/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.total_products).toBe(1);
      expect(response.body.supplier.id).toBe(1);
    });

  });
});