const Usuario = require('../../models-EsquemasMongoDB/Usuario');
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
    
    const {
      _id,
      name,
      lastName,
      secondLastName,
      email,
      password,
      phoneNumber,
      status,
      role,
      registrationDate,
      license,
      profilePicture
    } = req.body;

    // campos obligatorios
    if (
      _id === undefined ||
      !name ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !status ||
      !role ||
      !registrationDate ||
      !profilePicture
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      _id, 
      name,
      lastName,
      secondLastName: secondLastName || "",
      email,
      password: hashedPassword,
      phoneNumber,
      status,
      role,
      registrationDate: new Date(registrationDate), // a Date
      license: license || "",
      profilePicture
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('❌ Error al crear el usuario:', err);
    res.status(400).json({ error: '❌ Error al crear el usuario', detail: err.message });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(Number(req.params.id));
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};