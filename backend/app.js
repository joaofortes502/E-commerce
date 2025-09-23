const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ exnteded: true}));

app.get('/', (req, res) =>{
    res.json({
        message: "Começando projeto",
        timestamp: new Date().toISOString()
    })
})

app.listen(PORT, () =>{
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
})

