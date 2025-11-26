const express = require('express');
const cors = require('cors');
const path = require('path');
const {initializeAll,initializeDatabase, createDefaultAdmin, createSampleProducts} = require('./database/init');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const supplierRoutes = require('./routes/supplier');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ exnteded: true}));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);

app.get('/', (req, res) =>{
    res.json({
        message: "Começando projeto",
        timestamp: new Date().toISOString()
    })
})

async function startServer(){
    await initializeAll().then(() => {
        app.listen(PORT, () => {
                console.log(`Servidor rodando na porta ${PORT}`);
            });
        }).catch(error => {
            console.error('Falha na inicialização do sistema:', error);
            process.exit(1);
        });
}

startServer();

