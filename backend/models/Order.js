const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/sqlite.db');

class Order {
    static async createTables() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);

            db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
                    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
                    item_count INTEGER NOT NULL CHECK (item_count > 0),
                    shipping_address TEXT,
                    payment_method TEXT DEFAULT 'pending',
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `, (err) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }

                db.run(`
                    CREATE TABLE IF NOT EXISTS order_items (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_id INTEGER NOT NULL,
                        product_id INTEGER NOT NULL,
                        product_name TEXT NOT NULL,
                        product_description TEXT,
                        quantity INTEGER NOT NULL CHECK (quantity > 0),
                        unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
                        subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    )
                `, (err2) => {
                    db.close();
                    if (err2) {
                        reject(err2);
                    } else {
                        resolve('Tabelas orders e order_items criadas com sucesso');
                    }
                });
            });
        });
    }

    // Criar um pedido a partir do carrinho
    static async createFromCart(userId, orderData = {}) {
        return new Promise(async (resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            try {
                const Cart = require('./Cart');
                const cart = await Cart.getItems({ user_id: userId });
                
                if (!cart.items || cart.items.length === 0) {
                    db.close();
                    reject(new Error('Carrinho está vazio'));
                    return;
                }
                
                if (cart.has_stock_issues) {
                    db.close();
                    reject(new Error('Alguns itens do carrinho não têm estoque suficiente'));
                    return;
                }
                
                db.run('BEGIN TRANSACTION', async (err) => {
                    if (err) {
                        db.close();
                        reject(err);
                        return;
                    }
                    
                    try {
                        const orderResult = await Order._createOrderRecord(db, userId, cart, orderData);
                        const orderId = orderResult.orderId;
                        
                        await Order._createOrderItems(db, orderId, cart.items);
                        await Order._updateProductStocks(db, cart.items);
                        await Order._clearUserCart(db, userId);
                        
                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                db.close();
                                reject(commitErr);
                                return;
                            }
                            
                            Order.findByIdWithItems(orderId)
                                .then(completeOrder => {
                                    db.close();
                                    resolve({
                                        message: 'Pedido criado com sucesso',
                                        order: completeOrder
                                    });
                                })
                                .catch(fetchErr => {
                                    db.close();
                                    reject(fetchErr);
                                });
                        });
                        
                    } catch (operationError) {
                        db.run('ROLLBACK', (rollbackErr) => {
                            db.close();
                            if (rollbackErr) {
                                console.error('Erro no rollback:', rollbackErr);
                            }
                            reject(operationError);
                        });
                    }
                });
                
            } catch (error) {
                db.close();
                reject(error);
            }
        });
    }

    // Buscar pedido por ID com seus itens
    static async findByIdWithItems(orderId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`
                SELECT o.*, u.name as customer_name, u.email as customer_email
                FROM orders o
                INNER JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            `, [orderId], (err, order) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                
                if (!order) {
                    db.close();
                    reject(new Error('Pedido não encontrado'));
                    return;
                }
                
                db.all(`
                    SELECT * FROM order_items WHERE order_id = ? ORDER BY id
                `, [orderId], (itemsErr, items) => {
                    db.close();
                    
                    if (itemsErr) {
                        reject(itemsErr);
                    } else {
                        const completeOrder = {
                            ...order,
                            items: items || []
                        };
                        resolve(completeOrder);
                    }
                });
            });
        });
    }

    // Buscar pedidos de um usuário
    static async findByUser(userId, options = {}) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            let query = `
                SELECT o.*, 
                       COUNT(oi.id) as item_count_check,
                       u.name as customer_name
                FROM orders o
                INNER JOIN users u ON o.user_id = u.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `;
            
            const params = [userId];
            
            if (options.limit) {
                query += ` LIMIT ?`;
                params.push(options.limit);
            }
            
            db.all(query, params, (err, orders) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(orders || []);
                }
            });
        });
    }

    // Buscar todos os pedidos (admin)
    static async findAll(options = {}) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            let query = `
                SELECT o.*, 
                       u.name as customer_name,
                       u.email as customer_email,
                       COUNT(oi.id) as items_in_order
                FROM orders o
                INNER JOIN users u ON o.user_id = u.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
            `;
            
            const params = [];
            
            if (options.status) {
                query += ` WHERE o.status = ?`;
                params.push(options.status);
            }
            
            query += ` GROUP BY o.id ORDER BY o.created_at DESC`;
            
            if (options.limit) {
                query += ` LIMIT ?`;
                params.push(options.limit);
                
                if (options.offset) {
                    query += ` OFFSET ?`;
                    params.push(options.offset);
                }
            }
            
            db.all(query, params, (err, orders) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(orders || []);
                }
            });
        });
    }

    // Atualizar status do pedido
    static async updateStatus(orderId, newStatus, userId = null) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(newStatus)) {
                db.close();
                reject(new Error('Status inválido'));
                return;
            }
            
            let query = `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            let params = [newStatus, orderId];
            
            if (userId) {
                query += ` AND user_id = ?`;
                params.push(userId);
            }
            
            db.run(query, params, function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Pedido não encontrado ou sem permissão'));
                } else {
                    resolve({ message: 'Status atualizado com sucesso', new_status: newStatus });
                }
            });
        });
    }

    // Buscar estatísticas de vendas do mês
    static async getMonthSales(firstDay, lastDay) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`
                SELECT COUNT(*) as total_orders, 
                       COALESCE(SUM(total_amount), 0) as total_revenue
                FROM orders 
                
            `, [], (err, result) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(result || { total_orders: 0, total_revenue: 0 });
                }
            });
        });
    }

    // Buscar produto mais vendido
    static async getTopProduct() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`
                SELECT 
                    p.id,
                    p.name,
                    p.category,
                    p.price,
                    p.image_url,
                    SUM(oi.quantity) as total_sold,
                    COUNT(DISTINCT oi.order_id) as order_count,
                    SUM(oi.quantity * oi.unit_price) as total_revenue
                FROM order_items oi
                INNER JOIN products p ON oi.product_id = p.id
                GROUP BY p.id, p.name, p.category, p.price, p.image_url
                ORDER BY total_sold DESC
                LIMIT 1
            `, [], (err, result) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(result || null);
                }
            });
        });
    }

    // Buscar top 5 produtos mais vendidos
    static async getTopProducts(limit = 5) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT 
                    p.id,
                    p.name,
                    p.category,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.unit_price) as revenue
                FROM order_items oi
                INNER JOIN products p ON oi.product_id = p.id
                GROUP BY p.id, p.name, p.category
                ORDER BY total_sold DESC
                LIMIT ?
            `, [limit], (err, results) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(results || []);
                }
            });
        });
    }

    // ========== MÉTODOS AUXILIARES PRIVADOS ==========

    static _createOrderRecord(db, userId, cart, orderData) {
        return new Promise((resolve, reject) => {
            const totalAmount = parseFloat(cart.subtotal);
            const itemCount = cart.total_quantity;
            
            db.run(`
                INSERT INTO orders (user_id, total_amount, item_count, shipping_address, notes, payment_method)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                userId, 
                totalAmount, 
                itemCount, 
                orderData.shipping_address || '', 
                orderData.notes || '',
                orderData.payment_method || 'pending'
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ orderId: this.lastID, totalAmount, itemCount });
                }
            });
        });
    }

    static _createOrderItems(db, orderId, cartItems) {
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = cartItems.length;
            
            if (total === 0) {
                resolve();
                return;
            }
            
            cartItems.forEach(item => {
                const subtotal = item.quantity * item.price_when_added;
                
                db.run(`
                    INSERT INTO order_items (order_id, product_id, product_name, product_description, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, 
                    item.product_id, 
                    item.product_name, 
                    item.product_description || '', 
                    item.quantity, 
                    item.price_when_added, 
                    subtotal
                ], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                });
            });
        });
    }

    static _updateProductStocks(db, cartItems) {
        return new Promise((resolve, reject) => {
            let completed = 0;
            const total = cartItems.length;
            
            if (total === 0) {
                resolve();
                return;
            }
            
            cartItems.forEach(item => {
                db.run(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND stock_quantity >= ?
                `, [item.quantity, item.product_id, item.quantity], function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (this.changes === 0) {
                        reject(new Error(`Estoque insuficiente para o produto ${item.product_name}`));
                        return;
                    }
                    
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                });
            });
        });
    }

    static _clearUserCart(db, userId) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM cart_items WHERE user_id = ?`, [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = Order;