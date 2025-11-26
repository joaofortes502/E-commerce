const Product = require('../models/Product');

class ProductController {
    static async index(req, res) {
        try {
            const { category, inStock, page = 1, limit = 20 } = req.query;
            
            const options = {};
            
            if (category && category.trim() !== '') {
                options.category = category.trim();
            }
            
            if (inStock === 'true') {
                options.inStock = true;
            }
            
            // paginação básica
            if (limit && !isNaN(limit) && limit > 0) {
                options.limit = Math.min(parseInt(limit), 100);
                
                if (page && !isNaN(page) && page > 1) {
                    options.offset = (parseInt(page) - 1) * options.limit;
                }
            }
            
            const products = await Product.findAll(options);
            
            res.json({
                success: true,
                count: products.length,
                page: parseInt(page),
                limit: options.limit || null,
                products: products
            });
            
        } catch (error) {
            console.error('Erro ao buscar produtos:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async show(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
            }
            
            const product = await Product.findById(parseInt(id));
            
            res.json({
                success: true,
                product: product
            });
            
        } catch (error) {
            console.error('Erro ao buscar produto:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    static async store(req, res) {
        try {
            const { name, description, price, category, stock_quantity, image_url } = req.body;
            
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do produto é obrigatório'
                });
            }
            
            if (!price || isNaN(price) || parseFloat(price) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Preço deve ser um número maior que zero'
                });
            }
            
            if (!category || category.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria é obrigatória'
                });
            }
            
            let validStockQuantity = 0;
            if (stock_quantity !== undefined) {
                if (isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Quantidade em estoque deve ser um número não negativo'
                    });
                }
                validStockQuantity = parseInt(stock_quantity);
            }
            
            const newProduct = await Product.create({
                name: name.trim(),
                description: description?.trim() || '',
                price: parseFloat(price),
                category: category.trim(),
                stock_quantity: validStockQuantity,
                image_url: image_url?.trim() || '',
                created_by: req.user.id
            });
            
            res.status(201).json({
                success: true,
                message: 'Produto criado com sucesso',
                product: {
                    id: newProduct.id,
                    name: newProduct.name,
                    description: newProduct.description,
                    price: newProduct.price,
                    category: newProduct.category,
                    stock_quantity: newProduct.stock_quantity,
                    image_url: newProduct.image_url
                }
            });
            
        } catch (error) {
            console.error('Erro ao criar produto:', error.message);
            
            if (error.message.includes('obrigatório') || error.message.includes('deve ser')) {
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

    static async update(req, res) {
    try {
        const { id } = req.params;
        const { 
            name, 
            description, 
            price, 
            category, 
            stock_quantity, 
            image_url,
            supplier_id,
            supplier_sku,
            cost_price 
        } = req.body;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID do produto inválido'
            });
        }
        
        const updateData = {};
        
        if (name !== undefined) {
            if (name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do produto não pode estar vazio'
                });
            }
            updateData.name = name.trim();
        }
        
        if (description !== undefined) {
            updateData.description = description?.trim() || '';
        }
        
        if (price !== undefined) {
            if (isNaN(price) || parseFloat(price) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Preço deve ser um número maior que zero'
                });
            }
            updateData.price = parseFloat(price);
        }
        
        if (category !== undefined) {
            if (category.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria não pode estar vazia'
                });
            }
            updateData.category = category.trim();
        }
        
        if (stock_quantity !== undefined) {
            if (isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade em estoque deve ser um número não negativo'
                });
            }
            updateData.stock_quantity = parseInt(stock_quantity);
        }
        
        if (image_url !== undefined) {
            updateData.image_url = image_url?.trim() || '';
        }
        
        // NOVO: Campos do fornecedor
        if (supplier_id !== undefined) {
            if (supplier_id === '' || supplier_id === null) {
                // Permite remover o fornecedor definindo como null
                updateData.supplier_id = null;
            } else if (isNaN(supplier_id) || parseInt(supplier_id) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do fornecedor deve ser um número válido'
                });
            } else {
                updateData.supplier_id = parseInt(supplier_id);
            }
        }
        
        if (supplier_sku !== undefined) {
            updateData.supplier_sku = supplier_sku?.trim() || '';
        }
        
        if (cost_price !== undefined) {
            if (cost_price === '' || cost_price === null) {
                // Permite remover o preço de custo definindo como null
                updateData.cost_price = null;
            } else if (isNaN(cost_price) || parseFloat(cost_price) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Preço de custo deve ser um número maior que zero'
                });
            } else {
                updateData.cost_price = parseFloat(cost_price);
            }
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo válido fornecido para atualização'
            });
        }
        
        await Product.update(parseInt(id), updateData, req.user.id);
        
        const updatedProduct = await Product.findById(parseInt(id));
        
        res.json({
            success: true,
            message: 'Produto atualizado com sucesso',
            product: updatedProduct
        });
        
    } catch (error) {
        console.error('Erro ao atualizar produto:', error.message);
        
        if (error.message.includes('não encontrado')) {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        } else if (error.message.includes('Fornecedor não encontrado')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        } else if (error.message.includes('deve ser') || error.message.includes('obrigatório')) {
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

    static async destroy(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
            }
            
            await Product.delete(parseInt(id), req.user.id);
            
            res.json({
                success: true,
                message: 'Produto removido com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao deletar produto:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    static async byCategory(req, res) {
        try {
            const { category } = req.params;
            
            if (!category || category.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria é obrigatória'
                });
            }
            
            const products = await Product.findByCategory(category.trim());
            
            res.json({
                success: true,
                category: category.trim(),
                count: products.length,
                products: products
            });
            
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async checkStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity = 1 } = req.query;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
            }
            
            if (isNaN(quantity) || parseInt(quantity) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade deve ser um número maior que zero'
                });
            }
            
            const isAvailable = await Product.checkStock(parseInt(id), parseInt(quantity));
            
            res.json({
                success: true,
                product_id: parseInt(id),
                requested_quantity: parseInt(quantity),
                available: isAvailable
            });
            
        } catch (error) {
            console.error('Erro ao verificar estoque:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }
}

module.exports = ProductController;