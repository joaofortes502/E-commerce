const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database.sqlite');

class User {

    static async createTable(){
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(DB_PATH);

            db.run(`CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                type TEXT DEFAULT 'cliente' CHECK (type in ('cliente','admin')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                db.close();
                if(err) reject(err);
                else resolve('Tabela users criada com sucesso');
            });
        });
    }

    static async register(userData){
        const {name, email, password, type="client"} = userData;

        return new Promise(async (resolve, reject)=>{
            try {
                const hashedPassword = await bcrypt.hash(password, 12);

                const db = new sqlite3.Database(DB_PATH);

                db.run(`INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)`,
                    [name, email, hashedPassword, type],
                    function(err){
                        db.close();
                        if (err){
                            if(err.message.includes('UNIQUE constraint failed')){
                                reject(new Error('Email já registrado'));
                            } else{
                                reject(err);
                            }
                        }else{
                            resolve({
                                id: this.lastID,
                                name,
                                email,
                                type,
                                message: "Usuário registrado com sucesso"
                            });
                        }
                    }
                )
            } catch (error){
                reject(error);
            }
        })
    }

    static async login(email, password){
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(DB_PATH);

            db.get(`SELECT * FROM users WHERE email = ?`, 
                [email],
                async(err, user)=>{
                    db.close();

                    if(err){
                        reject(err);
                        return;
                    }
                    if(!user){
                        reject(new Error('Usuário não encontrado'));
                        return;
                    }

                    try {
                        const isValidPassword = await bcrypt.compare(password, user.password);
                        if(!isValidPassword){
                            reject(new Error('Senha incorreta'));
                            return;
                        }

                        const {password: _, ...userWithoutPassword} = user;
                        resolve(userWithoutPassword);
                    }
                    catch (error) { 
                        reject(error);
                    }
                }
            )
        })
    }

    static async findById(id){
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(DB_PATH);

            db.get(`
                SELECT id, name, email, type, created_at
                FROM users
                WHERE id = ?`,
            [id],(err,user)=>{
                db.close();

                if(err){
                    reject(err);
                }else if(!user){
                    reject(new Error('Usuário não encontrado'));
                } else{
                    resolve(user);
                }
            })
        })
    }

    static async updateProfile(id, updateData){
        const {name, email} = updateData;

        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(DB_PATH);

            db.run(`
                UPDATE users set name = ?, email = ? WHERE id = ?`,
            [name, email, id], function(err){
                db.close();

                if (err){
                    if(err.message.includes('UNIQUE constraint failed')){
                        reject (new Error('Email já está em uso'));
                    }else{
                        reject(err);
                    }

                }else if(this.changes === 0){
                    reject(new Error('Usuário não encontrado'));
                }else{
                    resolve({message: 'Perfil atualizado com sucesso'});
                }
            })
        })
    }

    static async isAdmin(userId){
        return new Promise((resolve, reject)=>{
            const db = new sqlite3.Database(DB_PATH);

            db.get(`
                SELECT type FROM users WHERE id = ?`,
            [userId],(err,user)=>{
                db.close();

                if(err){
                    reject(err);
                }else if(!user){
                    reject(new Error('Usuário não encontrado'));
                } else{
                    resolve(user.type === 'admin');
                }
            })
        })
    }
}

module.exports = User