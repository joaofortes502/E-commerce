const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '123456';

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, type } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, email e senha são obrigatórios'
                });
            }
            
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                });
            }
            
            const newUser = await User.register({ name, email, password, type });
            
            const token = jwt.sign(
                { 
                    id: newUser.id, 
                    email: newUser.email, 
                    type: newUser.type 
                },
                JWT_SECRET,
                { expiresIn: '24h' } // valido 24 horas
            );
            
            res.status(201).json({
                success: true,
                message: 'Usuário cadastrado com sucesso',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    type: newUser.type
                },
                token
            });
            
        } catch (error) {
            console.error('Erro no registro:', error.message);
            
            if (error.message.includes('já está em uso')) {
                res.status(409).json({
                    success: false,
                    message: 'Este email já está cadastrado'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
            }
            
            const user = await User.login(email, password);
            
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    type: user.type 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.type
                },
                token
            });
            
        } catch (error) {
            console.error('Erro no login:', error.message);
            
            if (error.message.includes('não encontrado') || error.message.includes('incorreta')) {
                res.status(401).json({
                    success: false,
                    message: 'Email ou senha incorretos'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            
            const user = await User.findById(userId);
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.type,
                    created_at: user.created_at
                }
            });
            
        } catch (error) {
            console.error('Erro ao buscar perfil:', error.message);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, email } = req.body;
            
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome e email são obrigatórios'
                });
            }
            
            await User.updateProfile(userId, { name, email });
            
            const updatedUser = await User.findById(userId);
            
            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    type: updatedUser.type
                }
            });
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error.message);
            
            if (error.message.includes('já está em uso')) {
                res.status(409).json({
                    success: false,
                    message: 'Este email já está sendo usado por outro usuário'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor'
                });
            }
        }
    }

    static logout(req, res) {
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
}

module.exports = AuthController;