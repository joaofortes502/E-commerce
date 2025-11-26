const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

class SupplierController {
    
    // Listar todos os fornecedores
    static async index(req, res) {
        try {
            const { status, category, search, page = 1, limit = 20 } = req.query;
            
            const options = {};
            
            if (status && ['active', 'inactive'].includes(status)) {
                options.status = status;
            }
            
            if (category && category.trim() !== '') {
                options.category = category.trim();
            }
            
            if (search && search.trim() !== '') {
                options.search = search.trim();
            }
            
            // Paginação
            if (limit && !isNaN(limit) && limit > 0) {
                options.limit = Math.min(parseInt(limit), 100);
                
                if (page && !isNaN(page) && page > 1) {
                    options.offset = (parseInt(page) - 1) * options.limit;
                }
            }
            
            const suppliers = await Supplier.findAll(options);
            
            res.json({
                success: true,
                count: suppliers.length,
                page: parseInt(page),
                limit: options.limit || null,
                filters: {
                    status: status || 'all',
                    category: category || 'all',
                    search: search || 'none'
                },
                suppliers: suppliers
            });
            
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Obter um fornecedor específico
    static async show(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor inválido'
                });
            }
            
            const supplier = await Supplier.findById(parseInt(id));
            
            res.json({
                success: true,
                supplier: supplier
            });
            
        } catch (error) {
            console.error('Erro ao buscar fornecedor:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Criar novo fornecedor
    static async store(req, res) {
        try {
            const { 
                name, 
                contact_name, 
                email, 
                phone, 
                address, 
                city, 
                state, 
                zip_code, 
                country, 
                cnpj, 
                category, 
                notes 
            } = req.body;
            
            // Validações básicas
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do fornecedor é obrigatório'
                });
            }
            
            if (email && !this._isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
            }
            
            if (cnpj && !this._isValidCNPJ(cnpj)) {
                return res.status(400).json({
                    success: false,
                    message: 'CNPJ inválido'
                });
            }
            
            const newSupplier = await Supplier.create({
                name: name.trim(),
                contact_name: contact_name?.trim() || '',
                email: email?.trim() || '',
                phone: phone?.trim() || '',
                address: address?.trim() || '',
                city: city?.trim() || '',
                state: state?.trim() || '',
                zip_code: zip_code?.trim() || '',
                country: country?.trim() || 'Brasil',
                cnpj: cnpj?.trim() || '',
                category: category?.trim() || '',
                notes: notes?.trim() || ''
            });
            
            res.status(201).json({
                success: true,
                message: 'Fornecedor criado com sucesso',
                supplier: {
                    id: newSupplier.id,
                    name: newSupplier.name,
                    contact_name: newSupplier.contact_name,
                    email: newSupplier.email,
                    phone: newSupplier.phone,
                    category: newSupplier.category,
                    status: newSupplier.status
                }
            });
            
        } catch (error) {
            console.error('Erro ao criar fornecedor:', error.message);
            
            if (error.message.includes('obrigatório') || 
                error.message.includes('CNPJ já cadastrado') ||
                error.message.includes('Email inválido') ||
                error.message.includes('CNPJ inválido')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Atualizar fornecedor
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { 
                name, 
                contact_name, 
                email, 
                phone, 
                address, 
                city, 
                state, 
                zip_code, 
                country, 
                cnpj, 
                category, 
                notes,
                status 
            } = req.body;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor inválido'
                });
            }
            
            const updateData = {};
            
            if (name !== undefined) {
                if (name.trim().length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nome do fornecedor não pode estar vazio'
                    });
                }
                updateData.name = name.trim();
            }
            
            if (contact_name !== undefined) {
                updateData.contact_name = contact_name?.trim() || '';
            }
            
            if (email !== undefined) {
                if (email && !this._isValidEmail(email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email inválido'
                    });
                }
                updateData.email = email?.trim() || '';
            }
            
            if (phone !== undefined) {
                updateData.phone = phone?.trim() || '';
            }
            
            if (address !== undefined) {
                updateData.address = address?.trim() || '';
            }
            
            if (city !== undefined) {
                updateData.city = city?.trim() || '';
            }
            
            if (state !== undefined) {
                updateData.state = state?.trim() || '';
            }
            
            if (zip_code !== undefined) {
                updateData.zip_code = zip_code?.trim() || '';
            }
            
            if (country !== undefined) {
                updateData.country = country?.trim() || 'Brasil';
            }
            
            if (cnpj !== undefined) {
                if (cnpj && !this._isValidCNPJ(cnpj)) {
                    return res.status(400).json({
                        success: false,
                        message: 'CNPJ inválido'
                    });
                }
                updateData.cnpj = cnpj?.trim() || '';
            }
            
            if (category !== undefined) {
                updateData.category = category?.trim() || '';
            }
            
            if (notes !== undefined) {
                updateData.notes = notes?.trim() || '';
            }
            
            if (status !== undefined) {
                if (!['active', 'inactive'].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Status deve ser "active" ou "inactive"'
                    });
                }
                updateData.status = status;
            }
            
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhum campo válido fornecido para atualização'
                });
            }
            
            await Supplier.update(parseInt(id), updateData);
            
            const updatedSupplier = await Supplier.findById(parseInt(id));
            
            res.json({
                success: true,
                message: 'Fornecedor atualizado com sucesso',
                supplier: updatedSupplier
            });
            
        } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            } else if (error.message.includes('CNPJ já cadastrado') || 
                       error.message.includes('não pode estar vazio') ||
                       error.message.includes('deve ser') ||
                       error.message.includes('inválido')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Excluir fornecedor
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor inválido'
                });
            }
            
            await Supplier.delete(parseInt(id));
            
            res.json({
                success: true,
                message: 'Fornecedor excluído com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            } else if (error.message.includes('produtos associados')) {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Desativar fornecedor (soft delete)
    static async deactivate(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor inválido'
                });
            }
            
            await Supplier.deactivate(parseInt(id));
            
            res.json({
                success: true,
                message: 'Fornecedor desativado com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao desativar fornecedor:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Obter produtos de um fornecedor
    static async getSupplierProducts(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor inválido'
                });
            }
            
            const products = await Supplier.getProducts(parseInt(id));
            
            res.json({
                success: true,
                supplier_id: parseInt(id),
                count: products.length,
                products: products
            });
            
        } catch (error) {
            console.error('Erro ao buscar produtos do fornecedor:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Obter estatísticas do fornecedor
    static async getSupplierStats(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor inválido'
                });
            }
            
            const stats = await Supplier.getStats(parseInt(id));
            const supplier = await Supplier.findById(parseInt(id));
            
            res.json({
                success: true,
                supplier: {
                    id: supplier.id,
                    name: supplier.name,
                    category: supplier.category
                },
                stats: stats
            });
            
        } catch (error) {
            console.error('Erro ao buscar estatísticas do fornecedor:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    // Obter estatísticas gerais de fornecedores (apenas admin)
    static async getAllSuppliersStats(req, res) {
        try {
            // Verificar se é admin
            if (!req.user || req.user.type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Apenas administradores podem acessar estas estatísticas'
                });
            }
            
            const suppliers = await Supplier.findAll();
            const supplierStats = await Product.getSupplierStats();
            
            const stats = {
                total_suppliers: suppliers.length,
                active_suppliers: suppliers.filter(s => s.status === 'active').length,
                inactive_suppliers: suppliers.filter(s => s.status === 'inactive').length,
                by_category: this._groupByCategory(suppliers),
                supplier_products_stats: supplierStats || []
            };
            
            res.json({
                success: true,
                stats: stats
            });
            
        } catch (error) {
            console.error('Erro ao buscar estatísticas gerais de fornecedores:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Métodos auxiliares privados
    static _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static _isValidCNPJ(cnpj) {
        // Remove caracteres não numéricos
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        
        // CNPJ deve ter 14 dígitos
        if (cleanCNPJ.length !== 14) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais (CNPJ inválido)
        if (/^(\d)\1+$/.test(cleanCNPJ)) {
            return false;
        }
        
        // Para fins de exemplo, aceita qualquer CNPJ com 14 dígitos não repetidos
        // Em produção, implementar algoritmo de validação completo do CNPJ
        return true;
    }

    static _groupByCategory(suppliers) {
        const categories = {};
        
        suppliers.forEach(supplier => {
            const category = supplier.category || 'Sem categoria';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category]++;
        });
        
        return categories;
    }
}

module.exports = SupplierController;
