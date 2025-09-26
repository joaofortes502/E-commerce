const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

async function initializeDatabase() {
    try {
        console.log('Inicializando banco de dados');
        
        await User.createTable();
        console.log('Tabela users criada');
    
        await Product.createTable();
        console.log('Tabela products criada');
        
        await Cart.createTable();
        console.log('Tabela cart_itens criada')
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

async function createSampleProducts() {
    try {
        const existingProducts = await Product.findAll({ limit: 1 });
        
        if (existingProducts.length > 0) {
            console.log('Produtos de exemplo já existem');
            return;
        }
        
        console.log('Criando produtos de exemplo...');
        
        let adminUser;
        try {
            adminUser = await User.login('admin@ecommerce.com', 'admin123');
        } catch (error) {
            console.log('Admin padrão não encontrado, pulando criação de produtos de exemplo');
            return;
        }
        
        const sampleProducts = [
            {
                name: 'Smartphone XYZ Pro',
                description: 'Smartphone com 128GB de armazenamento, câmera de 48MP e tela de 6.5 polegadas. Ideal para quem busca tecnologia e qualidade.',
                price: 899.99,
                category: 'Eletrônicos',
                stock_quantity: 25,
                image_url: 'https://via.placeholder.com/300x300?text=Smartphone',
                created_by: adminUser.id
            },
            {
                name: 'Notebook Gamer Ultra',
                description: 'Notebook para jogos com placa de vídeo dedicada, 16GB RAM e SSD 512GB. Perfeito para games e trabalho pesado.',
                price: 2499.90,
                category: 'Eletrônicos',
                stock_quantity: 10,
                image_url: 'https://via.placeholder.com/300x300?text=Notebook',
                created_by: adminUser.id
            },
            {
                name: 'Camiseta Básica Algodão',
                description: 'Camiseta 100% algodão, disponível em várias cores e tamanhos. Confortável e durável para o dia a dia.',
                price: 29.99,
                category: 'Roupas',
                stock_quantity: 50,
                image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
                created_by: adminUser.id
            },
            {
                name: 'Tênis Esportivo Runner',
                description: 'Tênis para corrida com tecnologia de amortecimento e design ergonômico. Ideal para atividades físicas.',
                price: 159.90,
                category: 'Calçados',
                stock_quantity: 30,
                image_url: 'https://via.placeholder.com/300x300?text=Tenis',
                created_by: adminUser.id
            },
            {
                name: 'Livro: JavaScript Moderno',
                description: 'Guia completo para desenvolvimento web com JavaScript ES6+. Inclui exemplos práticos e exercícios.',
                price: 89.90,
                category: 'Livros',
                stock_quantity: 15,
                image_url: 'https://via.placeholder.com/300x300?text=Livro+JS',
                created_by: adminUser.id
            },
            {
                name: 'Fones de Ouvido Bluetooth',
                description: 'Fones sem fio com cancelamento de ruído e bateria de 30 horas. Som de alta qualidade.',
                price: 199.99,
                category: 'Eletrônicos',
                stock_quantity: 20,
                image_url: 'https://via.placeholder.com/300x300?text=Fones',
                created_by: adminUser.id
            }
        ];
        
        let createdCount = 0;
        for (const productData of sampleProducts) {
            try {
                await Product.create(productData);
                createdCount++;
                console.log(`Produto "${productData.name}" criado`);
            } catch (error) {
                console.log(`Erro ao criar produto "${productData.name}":`, error.message);
            }
        }
        
        console.log(`${createdCount} produtos de exemplo criados com sucesso!`);
        
    } catch (error) {
        console.log('Erro geral ao criar produtos de exemplo:', error.message);
    }
}

module.exports = {
    initializeDatabase,
    createDefaultAdmin,
    createSampleProducts
};