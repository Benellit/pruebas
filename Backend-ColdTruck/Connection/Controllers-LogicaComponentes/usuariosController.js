const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.crearUsuario = async (req, res) => {
  try {
    const { name, lastName, phoneNumber, email, password, status, image, role } = req.body;
    const existingUser = await Usuario.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({ name, lastName, phoneNumber, email, password: hashedPassword, status, image, role });

    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(400).json({ error: '❌ Error al crear el usuario' });
  }
};