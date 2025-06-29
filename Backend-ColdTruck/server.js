const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const trackingRoutes = require('./routes-Endpoints/tracking');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
conectarDB();

// Rutas
app.use('/users', require('./routes-Endpoints/usuarios'));
app.use('/tracking', trackingRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
