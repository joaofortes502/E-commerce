const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const TEST_DB_PATH = path.join(__dirname, '../database/test.db');

const initializeTestDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEST_DB_PATH);
    
    db.serialize(() => {
      // Limpa e recria todas as tabelas
      db.run(`DROP TABLE IF EXISTS products`);
      db.run(`DROP TABLE IF EXISTS suppliers`);
      db.run(`DROP TABLE IF EXISTS users`);
      
      // Cria tabelas (mesmo schema do banco principal)
      db.run(`
        CREATE TABLE suppliers (
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
      `);
      
      // ... outras tabelas
    });
    
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = { initializeTestDatabase, TEST_DB_PATH };