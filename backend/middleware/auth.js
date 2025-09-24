const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || '123456';

const authenticateToken = (req, res, next) => {
    
    //formato esperado: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acesso não fornecido'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            //inválido ou expirado
            return res.status(403).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
        
        req.user = user;
        next(); //próximo middleware ou rota
    });
};

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        
        const isAdmin = await User.isAdmin(req.user.id);
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
            });
        }
        
        next(); //é admin proximo
    } catch (error) {
        console.error('Erro na verificação de admin:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user; 
            }
        });
    }
    
    next(); 
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};