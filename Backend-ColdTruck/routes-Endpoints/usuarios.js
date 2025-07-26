const express = require('express');
const { obtenerUsuarios, crearUsuario, obtenerUsuarioPorId  } = require('../Connection/Controllers-LogicaComponentes/usuariosController');
const router = express.Router();

router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);

module.exports = router;