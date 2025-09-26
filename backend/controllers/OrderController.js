const Order = require('../models/Order');
const Cart = require('../models/Cart');

class OrderController {
    
    // Criar um novo pedido a partir do carrinho
    static async createOrder(req, res) {
        try {
            // Verifica se o usuário está autenticado
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado. Faça login para finalizar a compra.'
                });
            }

            const { shipping_address, notes, payment_method } = req.body;
            const userId = req.user.id;

            // Validações básicas
            if (!shipping_address) {
                return res.status(400).json({
                    success: false,
                    message: 'Endereço de entrega é obrigatório'
                });
            }

            const orderData = {
                shipping_address,
                notes: notes || '',
                payment_method: payment_method || 'pending'
            };

            // Cria o pedido a partir do carrinho
            const result = await Order.createFromCart(userId, orderData);
            
            res.status(201).json({
                success: true,
                message: result.message,
                order: result.order
            });

        } catch (error) {
            console.error('Erro ao criar pedido:', error.message);
            
            if (error.message.includes('Carrinho está vazio')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('estoque suficiente')) {
                res.status(409).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor ao processar pedido'
                });
            }
        }
    }

    // Obter detalhes de um pedido específico
    static async getOrder(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do pedido é obrigatório e deve ser um número válido'
                });
            }

            const orderId = parseInt(id);
            let order;

            // Se for admin, pode ver qualquer pedido. Se não, só os próprios pedidos.
            if (req.user && req.user.type === 'admin') {
                order = await Order.findByIdWithItems(orderId);
            } else {
                if (!req.user || !req.user.id) {
                    return res.status(401).json({
                        success: false,
                        message: 'Usuário não autenticado'
                    });
                }
                order = await Order.findByIdWithItems(orderId);
                
                // Verifica se o pedido pertence ao usuário
                if (order && order.user_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Acesso negado. Este pedido pertence a outro usuário.'
                    });
                }
            }

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido não encontrado'
                });
            }

            res.json({
                success: true,
                order: order
            });

        } catch (error) {
            console.error('Erro ao buscar pedido:', error.message);
            
            if (error.message.includes('não encontrado')) {
                res.status(404).json({
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

    // Listar pedidos do usuário autenticado
    static async getUserOrders(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
            }

            const { limit } = req.query;
            const userId = req.user.id;

            const options = {};
            if (limit && !isNaN(limit) && parseInt(limit) > 0) {
                options.limit = parseInt(limit);
            }

            const orders = await Order.findByUser(userId, options);
            
            res.json({
                success: true,
                orders: orders,
                total_count: orders.length
            });

        } catch (error) {
            console.error('Erro ao buscar pedidos do usuário:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Listar todos os pedidos (apenas admin)
    static async getAllOrders(req, res) {
        try {
            // Verifica se é admin
            if (!req.user || req.user.type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado. Apenas administradores podem listar todos os pedidos.'
                });
            }

            const { status, limit, page } = req.query;
            const options = {};

            if (status && ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
                options.status = status;
            }

            if (limit && !isNaN(limit) && parseInt(limit) > 0) {
                options.limit = parseInt(limit);
                
                if (page && !isNaN(page) && parseInt(page) > 0) {
                    options.offset = (parseInt(page) - 1) * options.limit;
                }
            }

            const orders = await Order.findAll(options);
            
            res.json({
                success: true,
                orders: orders,
                total_count: orders.length,
                filters: {
                    status: status || 'all',
                    limit: options.limit || 'none',
                    page: page || 1
                }
            });

        } catch (error) {
            console.error('Erro ao buscar todos os pedidos:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar status do pedido
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do pedido é obrigatório'
                });
            }

            if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status é obrigatório e deve ser: pending, confirmed, shipped, delivered ou cancelled'
                });
            }

            const orderId = parseInt(id);
            let result;

            // Se for admin, pode atualizar qualquer pedido. Se não, só os próprios pedidos (com restrições).
            if (req.user && req.user.type === 'admin') {
                result = await Order.updateStatus(orderId, status);
            } else {
                if (!req.user || !req.user.id) {
                    return res.status(401).json({
                        success: false,
                        message: 'Usuário não autenticado'
                    });
                }
                
                // Usuários comuns só podem cancelar seus próprios pedidos
                if (status !== 'cancelled') {
                    return res.status(403).json({
                        success: false,
                        message: 'Apenas administradores podem atualizar para este status'
                    });
                }

                result = await Order.updateStatus(orderId, status, req.user.id);
            }

            const updatedOrder = await Order.findByIdWithItems(orderId);
            
            res.json({
                success: true,
                message: result.message,
                new_status: result.new_status,
                order: updatedOrder
            });

        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error.message);
            
            if (error.message.includes('não encontrado') || error.message.includes('sem permissão')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('Status inválido')) {
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

    // Obter estatísticas/resumo de pedidos (apenas admin)
    static async getOrdersSummary(req, res) {
        try {
            if (!req.user || req.user.type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Apenas administradores podem acessar estatísticas'
                });
            }

            const allOrders = await Order.findAll();
            
            const summary = {
                total_orders: allOrders.length,
                total_revenue: allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
                by_status: {
                    pending: allOrders.filter(o => o.status === 'pending').length,
                    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
                    shipped: allOrders.filter(o => o.status === 'shipped').length,
                    delivered: allOrders.filter(o => o.status === 'delivered').length,
                    cancelled: allOrders.filter(o => o.status === 'cancelled').length
                },
                average_order_value: allOrders.length > 0 ? 
                    allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) / allOrders.length : 0
            };

            res.json({
                success: true,
                summary: summary
            });

        } catch (error) {
            console.error('Erro ao buscar resumo de pedidos:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = OrderController;