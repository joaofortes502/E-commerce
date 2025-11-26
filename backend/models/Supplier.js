const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/sqlite.db');

class Supplier {
    static async createTable() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                CREATE TABLE IF NOT EXISTS suppliers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    contact_name TEXT,
                    email TEXT,
                    phone TEXT,
                    address TEXT,
                    city TEXT,
                    state TEXT,
                    zip_code TEXT,
                    country TEXT DEFAULT 'Brasil',
                    cnpj TEXT UNIQUE,
                    category TEXT,
                    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                db.close();
                if (err) reject(err);
                else resolve('Tabela suppliers criada com sucesso');
            });
        });
    }

    static async create(supplierData) {
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
        } = supplierData;
        
        return new Promise((resolve, reject) => {
            if (!name || name.trim().length === 0) {
                reject(new Error('Nome do fornecedor é obrigatório'));
                return;
            }
            
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`
                INSERT INTO suppliers (
                    name, contact_name, email, phone, address, city, state, 
                    zip_code, country, cnpj, category, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                name.trim(),
                contact_name || '',
                email || '',
                phone || '',
                address || '',
                city || '',
                state || '',
                zip_code || '',
                country || 'Brasil',
                cnpj || '',
                category || '',
                notes || ''
            ], function(err) {
                db.close();
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('CNPJ já cadastrado'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        ...supplierData,
                        message: 'Fornecedor criado com sucesso'
                    });
                }
            });
        });
    }

    static async findAll(options = {}) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            let query = `SELECT * FROM suppliers WHERE 1=1`;
            const params = [];
            
            if (options.status) {
                query += ` AND status = ?`;
                params.push(options.status);
            } else {
                query += ` AND status = 'active'`;
            }
            
            if (options.category) {
                query += ` AND category = ?`;
                params.push(options.category);
            }
            
            if (options.search) {
                query += ` AND (name LIKE ? OR contact_name LIKE ? OR email LIKE ?)`;
                const searchTerm = `%${options.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            query += ` ORDER BY name ASC`;
            
            if (options.limit) {
                query += ` LIMIT ?`;
                params.push(options.limit);
                
                if (options.offset) {
                    query += ` OFFSET ?`;
                    params.push(options.offset);
                }
            }
            
            db.all(query, params, (err, suppliers) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(suppliers || []);
                }
            });
        });
    }

    static async findById(supplierId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`SELECT * FROM suppliers WHERE id = ? AND status = 'active'`, [supplierId], (err, supplier) => {
                db.close();
                if (err) {
                    reject(err);
                } else if (!supplier) {
                    reject(new Error('Fornecedor não encontrado'));
                } else {
                    resolve(supplier);
                }
            });
        });
    }

    static async update(supplierId, updateData) {
        const {
            name, contact_name, email, phone, address, city, state,
            zip_code, country, cnpj, category, notes, status
        } = updateData;
        
        return new Promise((resolve, reject) => {
            if (name !== undefined && (!name || name.trim().length === 0)) {
                reject(new Error('Nome do fornecedor não pode estar vazio'));
                return;
            }
            
            const db = new sqlite3.Database(DB_PATH);
            
            const fieldsToUpdate = [];
            const values = [];
            
            if (name !== undefined) {
                fieldsToUpdate.push('name = ?');
                values.push(name.trim());
            }
            
            if (contact_name !== undefined) {
                fieldsToUpdate.push('contact_name = ?');
                values.push(contact_name);
            }
            
            if (email !== undefined) {
                fieldsToUpdate.push('email = ?');
                values.push(email);
            }
            
            if (phone !== undefined) {
                fieldsToUpdate.push('phone = ?');
                values.push(phone);
            }
            
            if (address !== undefined) {
                fieldsToUpdate.push('address = ?');
                values.push(address);
            }
            
            if (city !== undefined) {
                fieldsToUpdate.push('city = ?');
                values.push(city);
            }
            
            if (state !== undefined) {
                fieldsToUpdate.push('state = ?');
                values.push(state);
            }
            
            if (zip_code !== undefined) {
                fieldsToUpdate.push('zip_code = ?');
                values.push(zip_code);
            }
            
            if (country !== undefined) {
                fieldsToUpdate.push('country = ?');
                values.push(country);
            }
            
            if (cnpj !== undefined) {
                fieldsToUpdate.push('cnpj = ?');
                values.push(cnpj);
            }
            
            if (category !== undefined) {
                fieldsToUpdate.push('category = ?');
                values.push(category);
            }
            
            if (notes !== undefined) {
                fieldsToUpdate.push('notes = ?');
                values.push(notes);
            }
            
            if (status !== undefined) {
                fieldsToUpdate.push('status = ?');
                values.push(status);
            }
            
            fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
            values.push(supplierId);
            
            if (fieldsToUpdate.length === 1) {
                db.close();
                reject(new Error('Nenhum campo para atualizar'));
                return;
            }
            
            const updateQuery = `UPDATE suppliers SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            
            db.run(updateQuery, values, function(err) {
                db.close();
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('CNPJ já cadastrado'));
                    } else {
                        reject(err);
                    }
                } else if (this.changes === 0) {
                    reject(new Error('Fornecedor não encontrado'));
                } else {
                    resolve({ message: 'Fornecedor atualizado com sucesso' });
                }
            });
        });
    }

    static async delete(supplierId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            // Verificar se existem produtos associados a este fornecedor
            db.get(`SELECT COUNT(*) as product_count FROM products WHERE supplier_id = ? AND status = 'active'`, [supplierId], (err, result) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                
                if (result.product_count > 0) {
                    db.close();
                    reject(new Error('Não é possível excluir o fornecedor pois existem produtos associados a ele'));
                    return;
                }
                
                // Se não há produtos associados, pode excluir
                db.run(`DELETE FROM suppliers WHERE id = ?`, [supplierId], function(err) {
                    db.close();
                    if (err) {
                        reject(err);
                    } else if (this.changes === 0) {
                        reject(new Error('Fornecedor não encontrado'));
                    } else {
                        resolve({ message: 'Fornecedor excluído com sucesso' });
                    }
                });
            });
        });
    }

    static async deactivate(supplierId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.run(`UPDATE suppliers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [supplierId], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Fornecedor não encontrado'));
                } else {
                    resolve({ message: 'Fornecedor desativado com sucesso' });
                }
            });
        });
    }

    static async getProducts(supplierId) {
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

    static async getStats(supplierId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);
            
            db.get(`
                SELECT 
                    COUNT(*) as total_products,
                    COALESCE(SUM(p.stock_quantity), 0) as total_stock,
                    COALESCE(SUM(p.stock_quantity * p.price), 0) as stock_value
                FROM products p 
                WHERE p.supplier_id = ? AND p.status = 'active'
            `, [supplierId], (err, stats) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(stats || { total_products: 0, total_stock: 0, stock_value: 0 });
                }
            });
        });
    }
}

module.exports = Supplier;