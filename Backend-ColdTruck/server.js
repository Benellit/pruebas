const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
conectarDB();

// Rutas
app.use('/users', require('./routes-Endpoints/usuarios'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));