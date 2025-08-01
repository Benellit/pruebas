const express = require('express');
const router = express.Router();
const Usuario = require('../models-EsquemasMongoDB/Usuario');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login recibido:', req.body);

  const todos = await Usuario.find({ email: { $regex: email, $options: 'i' } });
  console.log('Usuarios similares encontrados:', todos);

  const usuario = await Usuario.findOne({ email: new RegExp('^' + email + '$', 'i') });
  console.log('Usuario encontrado:', usuario);

  if (!usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }
  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  res.json({
    message: 'Login exitoso',
    user: {
      id: usuario._id,
      name: usuario.name,
      lastName: usuario.lastName,
      email: usuario.email,
      status: usuario.status,
      image: usuario.image,
      role: usuario.role
    }
  });
});


module.exports = router;
