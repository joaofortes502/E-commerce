const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartController {
    static async addItem(req, res) {
        try {
            const { product_id, quantity = 1 } = req.body;
            
            if (!product_id || isNaN(product_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do produto é obrigatório e deve ser um número válido'
                });
            }
            
            if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade deve ser um número maior que zero'
                });
            }
            
            const productId = parseInt(product_id);
            const qty = parseInt(quantity);
            
            const identifier = CartController._getIdentifier(req, res);
            if (!identifier) return; 
            
            
            const result = await Cart.addItem(identifier, productId, qty);
            
            const updatedCart = await Cart.getItems(identifier);
            
            res.status(200).json({
                success: true,
                message: result.message,
                item_added: result.item,
                cart: updatedCart
            });
            
        } catch (error) {
            console.error('Erro ao adicionar item ao carrinho:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            } else if (error.message.includes('Estoque insuficiente')) {
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

    static async getCart(req, res) {
        try {
            const identifier = CartController._getIdentifier(req, res);
            if (!identifier) return;
            
            const cart = await Cart.getItems(identifier);
            
            res.json({
                success: true,
                cart: cart
            });
            
        } catch (error) {
            console.error('Erro ao buscar carrinho:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async updateItem(req, res) {
        try {
            const { id: productId } = req.params;
            const { quantity } = req.body;
            
            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
            }
            
            if (quantity === undefined || isNaN(quantity) || parseInt(quantity) < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade deve ser um número não negativo'
                });
            }
            
            const identifier = CartController._getIdentifier(req, res);
            if (!identifier) return;
            
            const result = await Cart.updateItemQuantity(identifier, parseInt(productId), parseInt(quantity));
            
            const updatedCart = await Cart.getItems(identifier);
            
            res.json({
                success: true,
                message: result.message,
                cart: updatedCart
            });
            
        } catch (error) {
            console.error('Erro ao atualizar item:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Item não encontrado no carrinho'
                });
            } else if (error.message.includes('Estoque insuficiente')) {
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

    static async removeItem(req, res) {
        try {
            const { id: productId } = req.params;
            
            if (!productId || isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do produto inválido'
                });
            }
            
            const identifier = CartController._getIdentifier(req, res);
            if (!identifier) return;
            
            const result = await Cart.removeItem(identifier, parseInt(productId));
            
            const updatedCart = await Cart.getItems(identifier);
            
            res.json({
                success: true,
                message: result.message,
                cart: updatedCart
            });
            
        } catch (error) {
            console.error('Erro ao remover item:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
                    success: false,
                    message: 'Item não encontrado no carrinho'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    static async clearCart(req, res) {
        try {
            const identifier = CartController._getIdentifier(req, res);
            if (!identifier) return;
            
            const result = await Cart.clearCart(identifier);
            
            res.json({
                success: true,
                message: result.message,
                items_removed: result.items_removed
            });
            
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // especial para migrar carrinho quando usuário faz login
    static async migrateCart(req, res) {
        try {
            // Este método só funciona para usuários autenticados
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
            }
            
            const { session_id } = req.body;
            
            if (!session_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da sessão é obrigatório para migração'
                });
            }
            
            const result = await Cart.migrateSessionCart(session_id, req.user.id);
            
            const finalCart = await Cart.getItems({ user_id: req.user.id });
            
            res.json({
                success: true,
                message: result.message,
                migrated_items: result.migrated_items,
                cart: finalCart
            });
            
        } catch (error) {
            console.error('Erro ao migrar carrinho:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async getCartSummary(req, res) {
        try {
            const identifier = CartController._getIdentifier(req, res);
            if (!identifier) return;
            
            const cart = await Cart.getItems(identifier);
            
            res.json({
                success: true,
                summary: {
                    item_count: cart.item_count,
                    total_quantity: cart.total_quantity,
                    subtotal: cart.subtotal,
                    has_items: cart.item_count > 0
                }
            });
            
        } catch (error) {
            console.error('Erro ao buscar resumo do carrinho:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }


    static _getIdentifier(req, res) {
        if (req.user && req.user.id) {
            return { user_id: req.user.id };
        }
        
        let sessionId = req.headers['x-session-id'] || req.session?.id;
        
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            
            res.setHeader('X-New-Session-Id', sessionId);
        }
        
        return { session_id: sessionId };
    }
}

module.exports = CartController;