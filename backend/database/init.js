const User = require('../models/User');

async function initializeDatabase() {
    try {
        console.log('Inicializando banco de dados');
        
        await User.createTable();
        console.log('Tabela users criada');
    
        // await Product.createTable();
        // await Order.createTable();
        // await OrderItem.createTable();
        
        console.log('Banco de dados inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error.message);
        process.exit(1); 
    }
}

async function createDefaultAdmin() {
    try {
        await User.register({
            name: 'Administrador',
            email: 'admin@ecommerce.com',
            password: 'admin123',
            type: 'admin'
        });
        console.log('Usuário admin padrão criado (admin@ecommerce.com / admin123)');
    } catch (error) {
        if (error.message.includes('já está em uso')) {
            console.log('Usuário admin padrão já existe');
        } else {
            console.log('Erro ao criar admin padrão:', error.message);
        }
    }
}

module.exports = {
    initializeDatabase,
    createDefaultAdmin
};