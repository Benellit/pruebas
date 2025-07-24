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
app.use('/user', require('./routes-Endpoints/usuarios'));
app.use('/tracking', require('./routes-Endpoints/tracking')); // Direccion en tiempo real (No en tiempo real):D
app.use('/', require('./routes-Endpoints/auth')); // Esto habilita POST /login
app.use('/driver', require('./routes-Endpoints/driver'));



// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
