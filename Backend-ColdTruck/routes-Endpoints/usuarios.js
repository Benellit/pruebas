const express = require('express');
const { obtenerUsuarios, crearUsuario } = require('../Connection/Controllers-LogicaComponentes/usuariosController');
const router = express.Router();

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);

module.exports = router;