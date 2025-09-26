const express = require('express');
const cors = require('cors');
const path = require('path');
const {initializeDatabase, createDefaultAdmin, createSampleProducts} = require('./database/init');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ exnteded: true}));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) =>{
    res.json({
        message: "Começando projeto",
        timestamp: new Date().toISOString()
    })
})

async function startServer(){
    try {
        await initializeDatabase();
        await createDefaultAdmin();
        await createSampleProducts();

        app.listen(PORT, () =>{
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}`);
        })
    } catch(error){
        console.error("Erro ao iniciar o servidor:", error);
        process.exit(1);
    }
}

startServer();

