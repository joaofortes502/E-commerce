const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/sqlite.db');

class Product {

    static async getTables(){
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(DB_PATH);
            db.all(`SELECT * FROM sqlite_master`,[],(err,rows)=>{
                db.close();
                if(err){
                    reject(err);
                }else{
                    resolve(rows) || []
                }
            })
            
        })
    }

    static async createTable() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
                    category TEXT NOT NULL,
                    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
                    image_url TEXT,
                    supplier_id INTEGER,
                    supplier_sku TEXT,
                    cost_price DECIMAL(10,2) CHECK (cost_price > 0),
                    min_stock_level INTEGER DEFAULT 0 CHECK (min_stock_level >= 0),
                    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                    created_by INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id),
                    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
                )
            `, (err) => {
                db.close();
                if (err) reject(err);
                else resolve('Tabela products criada com sucesso');
            });
        });
    }

    static async create(productData) {
        const { 
            name, 
            description, 
            price, 
            category, 
            stock_quantity = 0, 
            image_url, 
            created_by,
            supplier_id,
            supplier_sku,
            cost_price,
            min_stock_level = 0
        } = productData;
        
        return new Promise((resolve, reject) => {
            if (!name || name.trim().length === 0) {
                reject(new Error('Nome do produto é obrigatório'));
                return;
            }
            
            if (!price || price <= 0) {
                reject(new Error('Preço deve ser maior que zero'));
                return;
            }
            
            if (!category || category.trim().length === 0) {
                reject(new Error('Categoria é obrigatória'));
                return;
            }
            
            // Validar supplier_id se fornecido
            if (supplier_id) {
                const dbCheck = new sqlite3.Database(DB_PATH);
                dbCheck.get(`SELECT id FROM suppliers WHERE id = ? AND status = 'active'`, [supplier_id], (err, supplier) => {
                    dbCheck.close();
                    
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (!supplier) {
                        reject(new Error('Fornecedor não encontrado ou inativo'));
                        return;
                    }
                    
                    // Continuar com a criação do produto
                    Product._insertProduct(productData, resolve, reject);
                });
            } else {
                // Criar produto sem fornecedor
                Product._insertProduct(productData, resolve, reject);
            }
        });
    }

    static _insertProduct(productData, resolve, reject) {
        const { 
            name, 
            description, 
            price, 
            category, 
            stock_quantity = 0, 
            image_url, 
            created_by,
            supplier_id,
            supplier_sku,
            cost_price,
            min_stock_level = 0
        } = productData;
        
        const db = new sqlite3.Database(DB_PATH);
        
        db.run(`
            INSERT INTO products (
                name, description, price, category, stock_quantity, image_url, 
                created_by, supplier_id, supplier_sku, cost_price, min_stock_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name.trim(), 
            description || '', 
            price, 
            category.trim(), 
            stock_quantity, 
            image_url || '', 
            created_by,
            supplier_id || null,
            supplier_sku || '',
            cost_price || null,
            min_stock_level
        ], function(err) {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    name: name.trim(),
                    description: description || '',
                    price: price,
                    category: category.trim(),
                    stock_quantity: stock_quantity,
                    image_url: image_url || '',
                    supplier_id: supplier_id || null,
                    supplier_sku: supplier_sku || '',
                    cost_price: cost_price || null,
                    min_stock_level: min_stock_level,
                    created_by: created_by,
                    message: 'Produto criado com sucesso'
                });
            }
        });
    }

    static async findAll(options = {}) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            let query = `
                SELECT 
                    p.*, 
                    u.name as creator_name,
                    s.name as supplier_name,
                    s.contact_name as supplier_contact,
                    s.email as supplier_email
                FROM products p 
                LEFT JOIN users u ON p.created_by = u.id 
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.status = 'active'
            `;
            
            const params = [];
            
            if (options.category) {
                query += ` AND p.category = ?`;
                params.push(options.category);
            }
            
            if (options.supplier_id) {
                query += ` AND p.supplier_id = ?`;
                params.push(options.supplier_id);
            }
            
            if (options.inStock) {
                query += ` AND p.stock_quantity > 0`;
            }
            
            if (options.lowStock) {
                query += ` AND p.stock_quantity <= p.min_stock_level AND p.stock_quantity > 0`;
            }
            
            if (options.outOfStock) {
                query += ` AND p.stock_quantity = 0`;
            }
            
            query += ` ORDER BY p.created_at DESC`;
            
            if (options.limit) {
                query += ` LIMIT ?`;
                params.push(options.limit);
                
                if (options.offset) {
                    query += ` OFFSET ?`;
                    params.push(options.offset);
                }
            }
            
            db.all(query, params, (err, products) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(products || []);
                }
            });
        });
    }

    static async findById(productId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`
                SELECT 
                    p.*, 
                    u.name as creator_name,
                    s.name as supplier_name,
                    s.contact_name as supplier_contact,
                    s.email as supplier_email,
                    s.phone as supplier_phone
                FROM products p 
                LEFT JOIN users u ON p.created_by = u.id 
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.id = ? AND p.status = 'active'
            `, [productId], (err, product) => {
                db.close();
                if (err) {
                    reject(err);
                } else if (!product) {
                    reject(new Error('Produto não encontrado'));
                } else {
                    resolve(product);
                }
            });
        });
    }

    static async update(productId, updateData, userId) {
        const { 
            name, 
            description, 
            price, 
            category, 
            stock_quantity, 
            image_url,
            supplier_id,
            supplier_sku,
            cost_price,
            min_stock_level
        } = updateData;
        
        return new Promise((resolve, reject) => {
            if (name !== undefined && (!name || name.trim().length === 0)) {
                reject(new Error('Nome do produto não pode estar vazio'));
                return;
            }
            
            if (price !== undefined && price <= 0) {
                reject(new Error('Preço deve ser maior que zero'));
                return;
            }
            
            if (category !== undefined && (!category || category.trim().length === 0)) {
                reject(new Error('Categoria não pode estar vazia'));
                return;
            }
            
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`SELECT created_by FROM products WHERE id = ? AND status = 'active'`, [productId], (err, product) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                
                if (!product) {
                    db.close();
                    reject(new Error('Produto não encontrado'));
                    return;
                }
                
                // Validar supplier_id se fornecido
                if (supplier_id !== undefined && supplier_id !== null) {
                    db.get(`SELECT id FROM suppliers WHERE id = ? AND status = 'active'`, [supplier_id], (supplierErr, supplier) => {
                        if (supplierErr) {
                            db.close();
                            reject(supplierErr);
                            return;
                        }
                        
                        if (!supplier) {
                            db.close();
                            reject(new Error('Fornecedor não encontrado ou inativo'));
                            return;
                        }
                        
                        // Continuar com a atualização
                        Product._updateProduct(db, productId, updateData, resolve, reject);
                    });
                } else {
                    // Atualizar produto (pode remover o fornecedor definindo como null)
                    Product._updateProduct(db, productId, updateData, resolve, reject);
                }
            });
        });
    }

    static _updateProduct(db, productId, updateData, resolve, reject) {
        const { 
            name, 
            description, 
            price, 
            category, 
            stock_quantity, 
            image_url,
            supplier_id,
            supplier_sku,
            cost_price,
            min_stock_level
        } = updateData;
        
        const fieldsToUpdate = [];
        const values = [];
        
        if (name !== undefined) {
            fieldsToUpdate.push('name = ?');
            values.push(name.trim());
        }
        
        if (description !== undefined) {
            fieldsToUpdate.push('description = ?');
            values.push(description);
        }
        
        if (price !== undefined) {
            fieldsToUpdate.push('price = ?');
            values.push(price);
        }
        
        if (category !== undefined) {
            fieldsToUpdate.push('category = ?');
            values.push(category.trim());
        }
        
        if (stock_quantity !== undefined) {
            fieldsToUpdate.push('stock_quantity = ?');
            values.push(stock_quantity);
        }
        
        if (image_url !== undefined) {
            fieldsToUpdate.push('image_url = ?');
            values.push(image_url);
        }
        
        if (supplier_id !== undefined) {
            fieldsToUpdate.push('supplier_id = ?');
            values.push(supplier_id);
        }
        
        if (supplier_sku !== undefined) {
            fieldsToUpdate.push('supplier_sku = ?');
            values.push(supplier_sku);
        }
        
        if (cost_price !== undefined) {
            fieldsToUpdate.push('cost_price = ?');
            values.push(cost_price);
        }
        
        if (min_stock_level !== undefined) {
            fieldsToUpdate.push('min_stock_level = ?');
            values.push(min_stock_level);
        }
        
        fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
        values.push(productId);
        
        if (fieldsToUpdate.length === 1) { 
            db.close();
            reject(new Error('Nenhum campo para atualizar'));
            return;
        }
        
        const updateQuery = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        
        db.run(updateQuery, values, function(err) {
            db.close();
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('Produto não encontrado'));
            } else {
                resolve({ message: 'Produto atualizado com sucesso' });
            }
        });
    }

    static async delete(productId, userId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                UPDATE products 
                SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND status = 'active'
            `, [productId], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Produto não encontrado'));
                } else {
                    resolve({ message: 'Produto removido com sucesso' });
                }
            });
        });
    }

    static async findByCategory(category) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT 
                    p.*,
                    s.name as supplier_name
                FROM products p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.category = ? AND p.status = 'active' 
                ORDER BY p.name ASC
            `, [category], (err, products) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(products || []);
                }
            });
        });
    }

    static async findBySupplier(supplierId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT p.* 
                FROM products p 
                WHERE p.supplier_id = ? AND p.status = 'active'
                ORDER BY p.name ASC
            `, [supplierId], (err, products) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(products || []);
                }
            });
        });
    }

    static async checkStock(productId, quantity) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`
                SELECT stock_quantity FROM products 
                WHERE id = ? AND status = 'active'
            `, [productId], (err, product) => {
                db.close();
                if (err) {
                    reject(err);
                } else if (!product) {
                    reject(new Error('Produto não encontrado'));
                } else {
                    resolve(product.stock_quantity >= quantity);
                }
            });
        });
    }

    static async updateStock(productId, quantityToSubtract) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                UPDATE products 
                SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND stock_quantity >= ? AND status = 'active'
            `, [quantityToSubtract, productId, quantityToSubtract], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Estoque insuficiente ou produto não encontrado'));
                } else {
                    resolve({ message: 'Estoque atualizado com sucesso' });
                }
            });
        });
    }

    static async findLowStock(threshold = 10) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT 
                    p.id,
                    p.name,
                    p.category,
                    p.price,
                    p.stock_quantity,
                    p.image_url,
                    p.min_stock_level,
                    s.name as supplier_name,
                    s.contact_name as supplier_contact
                FROM products p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.stock_quantity < ? AND p.status = 'active'
                ORDER BY p.stock_quantity ASC
                LIMIT 10
            `, [threshold], (err, products) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(products || []);
                }
            });
        });
    }

    static async getProductsBySupplier(supplierId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT 
                    id,
                    name,
                    price,
                    stock_quantity,
                    category,
                    image_url,
                    created_at
                FROM products 
                WHERE supplier_id = ? AND status = 'active'
                ORDER BY name ASC
            `, [supplierId], (err, products) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(products || []);
                }
            });
        });
    }

    static async getSupplierStats() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.all(`
                SELECT 
                    s.id,
                    s.name as supplier_name,
                    COUNT(p.id) as product_count,
                    COALESCE(SUM(p.stock_quantity), 0) as total_stock,
                    COALESCE(SUM(p.stock_quantity * p.price), 0) as stock_value
                FROM suppliers s
                LEFT JOIN products p ON s.id = p.supplier_id AND p.status = 'active'
                WHERE s.status = 'active'
                GROUP BY s.id, s.name
                ORDER BY product_count DESC
            `, [], (err, stats) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(stats || []);
                }
            });
        });
    }
}

module.exports = Product;