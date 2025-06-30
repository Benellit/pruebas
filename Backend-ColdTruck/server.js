const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares :c
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
conectarDB();

// Rutas
app.use('/users', require('./routes-Endpoints/usuarios'));
app.use('/tracking', require('./routes-Endpoints/tracking')); // Direccion en tiempo real (No en tiempo real):D

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
