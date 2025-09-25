const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/sqlite.db');

class Cart {

    static async createTable() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS cart_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    session_id TEXT,
                    product_id INTEGER NOT NULL,
                    quantity INTEGER NOT NULL CHECK (quantity > 0),
                    price_when_added DECIMAL(10,2) NOT NULL,
                    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products(id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    UNIQUE(user_id, product_id),
                    UNIQUE(session_id, product_id),
                    CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR 
                           (user_id IS NULL AND session_id IS NOT NULL))
                )
            `, (err) => {
                db.close();
                if (err) reject(err);
                else resolve('Tabela cart_items criada com sucesso');
            });
        });
    }

    static async addItem(identifier, productId, quantity) {
        return new Promise(async (resolve, reject) => {
            try {
                const Product = require('./Product');
                const product = await Product.findById(productId);
                
                const hasStock = await Product.checkStock(productId, quantity);
                if (!hasStock) {
                    reject(new Error('Estoque insuficiente para a quantidade solicitada'));
                    return;
                }
                
                const db = new sqlite3.Database(DB_PATH);
                
                // usuário logado ou sessão anônima
                const isLoggedUser = typeof identifier.user_id !== 'undefined';

                const whereClause = isLoggedUser 
                    ? 'user_id = ? AND product_id = ?' 
                    : 'session_id = ? AND product_id = ?';

                const identifierValue = isLoggedUser ? identifier.user_id : identifier.session_id;
                
                db.get(`
                    SELECT * FROM cart_items 
                    WHERE ${whereClause}
                `, [identifierValue, productId], (err, existingItem) => {
                    if (err) {
                        db.close();
                        reject(err);
                        return;
                    }
                    
                    if (existingItem) {
                        // já existe
                        const newQuantity = existingItem.quantity + quantity;
                        
                        // nova quantidade não excede o estoque
                        Product.checkStock(productId, newQuantity)
                            .then(hasEnoughStock => {
                                if (!hasEnoughStock) {
                                    db.close();
                                    reject(new Error(`Estoque insuficiente. Máximo disponível: ${product.stock_quantity}, você já tem ${existingItem.quantity} no carrinho`));
                                    return;
                                }
                                
                                // atualizar quantidade existente
                                db.run(`
                                    UPDATE cart_items 
                                    SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
                                    WHERE id = ?
                                `, [newQuantity, existingItem.id], function(err) {
                                    db.close();
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve({
                                            message: 'Quantidade atualizada no carrinho',
                                            item: {
                                                id: existingItem.id,
                                                product_id: productId,
                                                product_name: product.name,
                                                quantity: newQuantity,
                                                price: existingItem.price_when_added,
                                                subtotal: (newQuantity * existingItem.price_when_added).toFixed(2)
                                            }
                                        });
                                    }
                                });
                            })
                            .catch(stockErr => {
                                db.close();
                                reject(stockErr);
                            });
                    } else {
                        // item novo 
                        const insertQuery = isLoggedUser
                            ? `INSERT INTO cart_items (user_id, product_id, quantity, price_when_added) VALUES (?, ?, ?, ?)`
                            : `INSERT INTO cart_items (session_id, product_id, quantity, price_when_added) VALUES (?, ?, ?, ?)`;
                        
                        db.run(insertQuery, [identifierValue, productId, quantity, product.price], function(err) {
                            db.close();
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    message: 'Item adicionado ao carrinho',
                                    item: {
                                        id: this.lastID,
                                        product_id: productId,
                                        product_name: product.name,
                                        quantity: quantity,
                                        price: product.price,
                                        subtotal: (quantity * product.price).toFixed(2)
                                    }
                                });
                            }
                        });
                    }
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // todos os itens do carrinho de um usuário ou sessão
    static async getItems(identifier) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            const isLoggedUser = typeof identifier.user_id !== 'undefined';
            const whereClause = isLoggedUser ? 'ci.user_id = ?' : 'ci.session_id = ?';
            const identifierValue = isLoggedUser ? identifier.user_id : identifier.session_id;
            
            // Query complexa que junta carrinho com dados atuais dos produtos
            db.all(`
                SELECT 
                    ci.id,
                    ci.product_id,
                    ci.quantity,
                    ci.price_when_added,
                    ci.added_at,
                    p.name as product_name,
                    p.description as product_description,
                    p.price as current_price,
                    p.stock_quantity,
                    p.image_url,
                    p.status as product_status,
                    CASE 
                        WHEN ci.price_when_added != p.price THEN 1 
                        ELSE 0 
                    END as price_changed,
                    CASE 
                        WHEN p.stock_quantity >= ci.quantity THEN 1 
                        ELSE 0 
                    END as stock_available,
                    (ci.quantity * ci.price_when_added) as subtotal
                FROM cart_items ci
                INNER JOIN products p ON ci.product_id = p.id
                WHERE ${whereClause} AND p.status = 'active'
                ORDER BY ci.added_at DESC
            `, [identifierValue], (err, items) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    // totais
                    const cartSummary = {
                        items: items || [],
                        item_count: items ? items.length : 0,
                        total_quantity: items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0,
                        subtotal: items ? items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2) : '0.00',
                        has_price_changes: items ? items.some(item => item.price_changed === 1) : false,
                        has_stock_issues: items ? items.some(item => item.stock_available === 0) : false
                    };
                    
                    resolve(cartSummary);
                }
            });
        });
    }

    // atualizar a quantidade de um item específico no carrinho
    static async updateItemQuantity(identifier, productId, newQuantity) {
        return new Promise(async (resolve, reject) => {
            try {
                if (newQuantity <= 0) {
                    return await Cart.removeItem(identifier, productId);
                }
                
                const Product = require('./Product');
                const hasStock = await Product.checkStock(productId, newQuantity);
                if (!hasStock) {
                    reject(new Error('Estoque insuficiente para a quantidade solicitada'));
                    return;
                }
                
                const db = new sqlite3.Database(DB_PATH);
                
                const isLoggedUser = typeof identifier.user_id !== 'undefined';
                const whereClause = isLoggedUser 
                    ? 'user_id = ? AND product_id = ?' 
                    : 'session_id = ? AND product_id = ?';
                const identifierValue = isLoggedUser ? identifier.user_id : identifier.session_id;
                
                db.run(`
                    UPDATE cart_items 
                    SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE ${whereClause}
                `, [newQuantity, identifierValue, productId], function(err) {
                    db.close();
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Item não encontrado no carrinho'));
                    } else {
                        resolve({ 
                            message: 'Quantidade atualizada com sucesso',
                            new_quantity: newQuantity 
                        });
                    }
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // remover um item específico do carrinho
    static async removeItem(identifier, productId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            const isLoggedUser = typeof identifier.user_id !== 'undefined';
            const whereClause = isLoggedUser 
                ? 'user_id = ? AND product_id = ?' 
                : 'session_id = ? AND product_id = ?';
            const identifierValue = isLoggedUser ? identifier.user_id : identifier.session_id;
            
            db.run(`
                DELETE FROM cart_items WHERE ${whereClause}
            `, [identifierValue, productId], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Item não encontrado no carrinho'));
                } else {
                    resolve({ message: 'Item removido do carrinho' });
                }
            });
        });
    }

    // limpar completamente o carrinho
    static async clearCart(identifier) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            const isLoggedUser = typeof identifier.user_id !== 'undefined';
            const whereClause = isLoggedUser ? 'user_id = ?' : 'session_id = ?';
            const identifierValue = isLoggedUser ? identifier.user_id : identifier.session_id;
            
            db.run(`DELETE FROM cart_items WHERE ${whereClause}`, [identifierValue], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        message: 'Carrinho limpo com sucesso',
                        items_removed: this.changes 
                    });
                }
            });
        });
    }

    // especial para migrar carrinho de sessão anônima para usuário logado
    static async migrateSessionCart(sessionId, userId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT * FROM cart_items WHERE session_id = ?
            `, [sessionId], (err, sessionItems) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                
                if (!sessionItems || sessionItems.length === 0) {
                    db.close();
                    resolve({ message: 'Nenhum item para migrar', migrated_items: 0 });
                    return;
                }
                
                // Para cada item da sessão, tentamos migrar para o usuário
                let migratedCount = 0;
                let processedCount = 0;
                
                sessionItems.forEach(item => {
                    db.get(`
                        SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?
                    `, [userId, item.product_id], (err, existingUserItem) => {
                        if (err) {
                            console.error('Erro ao verificar item existente:', err);
                        } else if (existingUserItem) {
                            const newQuantity = existingUserItem.quantity + item.quantity;
                            db.run(`
                                UPDATE cart_items 
                                SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
                                WHERE id = ?
                            `, [newQuantity, existingUserItem.id], (updateErr) => {
                                if (!updateErr) migratedCount++;
                            });
                        } else {
                            db.run(`
                                UPDATE cart_items 
                                SET user_id = ?, session_id = NULL, updated_at = CURRENT_TIMESTAMP 
                                WHERE id = ?
                            `, [userId, item.id], (updateErr) => {
                                if (!updateErr) migratedCount++;
                            });
                        }
                        
                        processedCount++;
                        
                        if (processedCount === sessionItems.length) {
                            db.run(`DELETE FROM cart_items WHERE session_id = ?`, [sessionId], (cleanupErr) => {
                                db.close();
                                if (cleanupErr) {
                                    console.error('Erro na limpeza:', cleanupErr);
                                }
                                resolve({
                                    message: 'Carrinho migrado com sucesso',
                                    migrated_items: migratedCount
                                });
                            });
                        }
                    });
                });
            });
        });
    }

    // limpar carrinhos abandonados antigos (manutenção do sistema)
    static async cleanupOldCarts(daysOld = 30) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                DELETE FROM cart_items 
                WHERE updated_at < datetime('now', '-${daysOld} days')
                AND session_id IS NOT NULL
            `, function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        message: 'Carrinhos antigos limpos',
                        removed_items: this.changes
                    });
                }
            });
        });
    }
}

module.exports = Cart;