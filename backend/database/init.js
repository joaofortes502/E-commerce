const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');

async function initializeDatabase() {
    try {
        console.log('Inicializando banco de dados');
        
        await User.createTable();
        console.log('Tabela users criada');
    
        await Product.createTable();
        console.log('Tabela products criada');
        
        await Cart.createTable();
        console.log('Tabela cart_itens criada')
        
        await Order.createTables();
        console.log('Tabele orders e orders_itens criadas');

        await Supplier.createTable();
        console.log('Tabela supplier criada');

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
            email: 'admin@admin.com',
            password: '123456',
            type: 'admin'
        });
        console.log('Usuário admin padrão criado (admin@admin.com / 123456)');
    } catch (error) {
        if (error.message.includes('já está em uso')) {
            console.log('Usuário admin padrão já existe');
        } else {
            console.log('Erro ao criar admin padrão:', error.message);
        }
    }
}

async function createSampleSuppliers() {
    try {
        const existingSuppliers = await Supplier.findAll({ limit: 1 });
        
        if (existingSuppliers.length > 0) {
            console.log('Fornecedores de exemplo já existem');
            return;
        }
        
        console.log('Criando fornecedores de exemplo...');
        
        const sampleSuppliers = [
            {
                name: 'TechImport Brasil LTDA',
                contact_name: 'Carlos Silva',
                email: 'vendas@techimport.com.br',
                phone: '(11) 3456-7890',
                address: 'Av. Paulista, 1000',
                city: 'São Paulo',
                state: 'SP',
                zip_code: '01310-100',
                cnpj: '12.345.678/0001-90',
                category: 'Eletrônicos',
                notes: 'Fornecedor especializado em eletrônicos e gadgets'
            },
            {
                name: 'ModaStyle Confecções',
                contact_name: 'Ana Oliveira',
                email: 'compras@modastyle.com.br',
                phone: '(21) 2345-6789',
                address: 'Rua do Ouvidor, 50',
                city: 'Rio de Janeiro',
                state: 'RJ',
                zip_code: '20040-030',
                cnpj: '23.456.789/0001-01',
                category: 'Roupas',
                notes: 'Confeccção de roupas casual e esportiva'
            },
            {
                name: 'Calçados Premium SA',
                contact_name: 'Roberto Santos',
                email: 'atendimento@calcadospremium.com.br',
                phone: '(51) 3456-7890',
                address: 'Rua dos Andradas, 500',
                city: 'Porto Alegre',
                state: 'RS',
                zip_code: '90020-000',
                cnpj: '34.567.890/0001-12',
                category: 'Calçados',
                notes: 'Fabricante de calçados esportivos e casuais'
            },
            {
                name: 'Livraria Conhecimento & Cia',
                contact_name: 'Maria Fernandes',
                email: 'pedidos@livrariaconhecimento.com.br',
                phone: '(31) 2345-6789',
                address: 'Av. Afonso Pena, 2000',
                city: 'Belo Horizonte',
                state: 'MG',
                zip_code: '30130-000',
                cnpj: '45.678.901/0001-23',
                category: 'Livros',
                notes: 'Distribuidora de livros técnicos e literários'
            },
            {
                name: 'Casa & Decoração Import',
                contact_name: 'João Pereira',
                email: 'vendas@casedecoracao.com.br',
                phone: '(41) 3456-7890',
                address: 'Rua XV de Novembro, 300',
                city: 'Curitiba',
                state: 'PR',
                zip_code: '80020-000',
                cnpj: '56.789.012/0001-34',
                category: 'Casa e Decoração',
                notes: 'Importadora de produtos para casa e decoração'
            },
            {
                name: 'Esportes Radical Brasil',
                contact_name: 'Pedro Almeida',
                email: 'comercial@esportesradical.com.br',
                phone: '(85) 2345-6789',
                address: 'Av. Beira Mar, 1500',
                city: 'Fortaleza',
                state: 'CE',
                zip_code: '60165-121',
                cnpj: '67.890.123/0001-45',
                category: 'Esportes',
                notes: 'Equipamentos e acessórios esportivos'
            }
        ];
        
        let createdCount = 0;
        for (const supplierData of sampleSuppliers) {
            try {
                await Supplier.create(supplierData);
                createdCount++;
                console.log(`Fornecedor "${supplierData.name}" criado`);
            } catch (error) {
                console.log(`Erro ao criar fornecedor "${supplierData.name}":`, error.message);
            }
        }
        
        console.log(`${createdCount} fornecedores de exemplo criados com sucesso!`);
        
    } catch (error) {
        console.log('Erro geral ao criar fornecedores de exemplo:', error.message);
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
            adminUser = await User.login('admin@admin.com', '123456');
        } catch (error) {
            console.log('Admin padrão não encontrado, pulando criação de produtos de exemplo');
            return;
        }

        // Buscar fornecedores para associar aos produtos
        const suppliers = await Supplier.findAll();
        if (suppliers.length === 0) {
            console.log('Nenhum fornecedor encontrado, criando produtos sem fornecedor...');
        }
        
        const sampleProducts = [
            {
                name: 'Smartphone XYZ Pro',
                description: 'Smartphone com 128GB de armazenamento, câmera de 48MP e tela de 6.5 polegadas. Ideal para quem busca tecnologia e qualidade.',
                price: 899.99,
                category: 'Eletrônicos',
                stock_quantity: 25,
                image_url: 'https://via.placeholder.com/300x300?text=Smartphone',
                created_by: adminUser.id,
                supplier_id: suppliers.find(s => s.category === 'Eletrônicos')?.id,
                supplier_sku: 'TECH-SMART-001',
                cost_price: 650.00,
                min_stock_level: 5
            },
            {
                name: 'Notebook Gamer Ultra',
                description: 'Notebook para jogos com placa de vídeo dedicada, 16GB RAM e SSD 512GB. Perfeito para games e trabalho pesado.',
                price: 2499.90,
                category: 'Eletrônicos',
                stock_quantity: 10,
                image_url: 'https://via.placeholder.com/300x300?text=Notebook',
                created_by: adminUser.id,
                supplier_id: suppliers.find(s => s.category === 'Eletrônicos')?.id,
                supplier_sku: 'TECH-NOTE-002',
                cost_price: 1850.00,
                min_stock_level: 3
            },
            {
                name: 'Camiseta Básica Algodão',
                description: 'Camiseta 100% algodão, disponível em várias cores e tamanhos. Confortável e durável para o dia a dia.',
                price: 29.99,
                category: 'Roupas',
                stock_quantity: 50,
                image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
                created_by: adminUser.id,
                supplier_id: suppliers.find(s => s.category === 'Roupas')?.id,
                supplier_sku: 'MODA-CAM-001',
                cost_price: 15.00,
                min_stock_level: 10
            },
            {
                name: 'Tênis Esportivo Runner',
                description: 'Tênis para corrida com tecnologia de amortecimento e design ergonômico. Ideal para atividades físicas.',
                price: 159.90,
                category: 'Calçados',
                stock_quantity: 30,
                image_url: 'https://via.placeholder.com/300x300?text=Tenis',
                created_by: adminUser.id,
                supplier_id: suppliers.find(s => s.category === 'Calçados')?.id,
                supplier_sku: 'CALC-TEN-001',
                cost_price: 95.00,
                min_stock_level: 8
            },
            {
                name: 'Livro: JavaScript Moderno',
                description: 'Guia completo para desenvolvimento web com JavaScript ES6+. Inclui exemplos práticos e exercícios.',
                price: 89.90,
                category: 'Livros',
                stock_quantity: 15,
                image_url: 'https://via.placeholder.com/300x300?text=Livro+JS',
                created_by: adminUser.id,
                supplier_id: suppliers.find(s => s.category === 'Livros')?.id,
                supplier_sku: 'LIV-JS-001',
                cost_price: 45.00,
                min_stock_level: 5
            },
            {
                name: 'Fones de Ouvido Bluetooth',
                description: 'Fones sem fio com cancelamento de ruído e bateria de 30 horas. Som de alta qualidade.',
                price: 199.99,
                category: 'Eletrônicos',
                stock_quantity: 20,
                image_url: 'https://via.placeholder.com/300x300?text=Fones',
                created_by: adminUser.id,
                supplier_id: suppliers.find(s => s.category === 'Eletrônicos')?.id,
                supplier_sku: 'TECH-FONE-003',
                cost_price: 120.00,
                min_stock_level: 6
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

// Função principal para inicializar tudo
async function initializeAll() {
    try {
        await initializeDatabase();
        await createDefaultAdmin();
        await createSampleSuppliers(); // Criar fornecedores primeiro
        await createSampleProducts(); // Depois criar produtos (que dependem dos fornecedores)
        
        console.log('=== Sistema inicializado completamente ===');
        console.log('- Banco de dados criado');
        console.log('- Usuário admin criado');
        console.log('- Fornecedores de exemplo criados');
        console.log('- Produtos de exemplo criados');
        console.log('==========================================');
        
    } catch (error) {
        console.error('Erro durante a inicialização completa:', error.message);
        process.exit(1);
    }
}

module.exports = {
    initializeDatabase,
    createDefaultAdmin,
    createSampleProducts,
    createSampleSuppliers,
    initializeAll
};
