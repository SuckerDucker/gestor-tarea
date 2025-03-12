const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/database');

const router = express.Router();

// Endpoint de registro
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el email ya existe
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error('Error al verificar email:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar nuevo usuario
      const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
      connection.query(sql, [nombre, email, hashedPassword], (error, result) => {
        if (error) {
          console.error('Error al registrar usuario:', error);
          return res.status(500).json({ error: 'Error en el servidor' });
        }

        // Generar token
        const token = jwt.sign(
          { id: result.insertId, nombre, email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Usuario registrado correctamente',
          token,
          usuario: {
            id: result.insertId,
            nombre,
            email
          }
        });
      });
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint de login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    // Buscar usuario por email
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error('Error al buscar usuario:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const usuario = results[0];

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, usuario.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email
        }
      });
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para verificar token (útil para el cliente)
router.get('/verificar', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      valido: true, 
      usuario: { 
        id: decoded.id, 
        nombre: decoded.nombre, 
        email: decoded.email 
      } 
    });
  } catch (error) {
    res.status(401).json({ valido: false, error: 'Token no válido' });
  }
});

module.exports = router;