const express = require('express');
const { obtenerUsuarios, crearUsuario } = require('../controllers/usuariosController');
const router = express.Router();

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);

module.exports = router;