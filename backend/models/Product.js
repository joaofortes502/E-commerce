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
                    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                    created_by INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )
            `, (err) => {
                db.close();
                if (err) reject(err);
                else resolve('Tabela products criada com sucesso');
            });
        });
    }

    static async create(productData) {
        const { name, description, price, category, stock_quantity = 0, image_url, created_by } = productData;
        
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
            
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                INSERT INTO products (name, description, price, category, stock_quantity, image_url, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [name.trim(), description || '', price, category.trim(), stock_quantity, image_url || '', created_by],
            function(err) {
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
                        created_by: created_by,
                        message: 'Produto criado com sucesso'
                    });
                }
            });
        });
    }

    static async findAll(options = {}) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            let query = `
                SELECT p.*, u.name as creator_name 
                FROM products p 
                LEFT JOIN users u ON p.created_by = u.id 
                WHERE p.status = 'active'
            `;
            
            const params = [];
            
            if (options.category) {
                query += ` AND p.category = ?`;
                params.push(options.category);
            }
            
            if (options.inStock) {
                query += ` AND p.stock_quantity > 0`;
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
                SELECT p.*, u.name as creator_name 
                FROM products p 
                LEFT JOIN users u ON p.created_by = u.id 
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
        const { name, description, price, category, stock_quantity, image_url } = updateData;
        
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
            
            db.get(`
                SELECT created_by FROM products WHERE id = ? AND status = 'active'
            `, [productId], (err, product) => {
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
            });
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
                SELECT * FROM products 
                WHERE category = ? AND status = 'active' 
                ORDER BY name ASC
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
}

module.exports = Product;