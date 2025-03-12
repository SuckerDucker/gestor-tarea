const express = require("express");
const connection = require("../config/database");

const router = express.Router();

// Agregar un nuevo usuario
router.post("/", (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
  }

  // Verificar si el email ya existe
  connection.query("SELECT * FROM usuarios WHERE email = ?", [email], (error, results) => {
    if (error) {
      console.error("Error al verificar email:", error);
      return res.status(500).json({ error: "Error al registrar usuario" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Insertar nuevo usuario
    const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    const values = [nombre, email, password]; // En producción deberías encriptar la contraseña

    connection.query(sql, values, (error, result) => {
      if (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error al registrar usuario" });
      }
      res.status(201).json({ message: "Usuario registrado correctamente", id: result.insertId });
    });
  });
});

// Obtener todos los usuarios
router.get("/", (req, res) => {
  const sql = "SELECT id, nombre, email FROM usuarios"; // No devolvemos contraseñas
  
  connection.query(sql, (error, results) => {
    if (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }
    res.json(results);
  });
});

// Obtener información de un usuario por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT id, nombre, email FROM usuarios WHERE id = ?"; // No devolvemos contraseña
  
  connection.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error al obtener usuario:", error);
      return res.status(500).json({ error: "Error al obtener el usuario" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(results[0]);
  });
});

// Editar datos de un usuario
router.put("/:id", (req, res) => {
  const { nombre, email, password } = req.body;
  const { id } = req.params;

  // Verificar si el usuario existe
  connection.query("SELECT * FROM usuarios WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("Error al verificar usuario:", error);
      return res.status(500).json({ error: "Error al actualizar usuario" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar usuario
    const sql = "UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?";
    const values = [nombre, email, password, id]; // En producción deberías encriptar la contraseña

    connection.query(sql, values, (error, result) => {
      if (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({ error: "Error al actualizar usuario" });
      }
      res.json({ message: "Usuario actualizado correctamente" });
    });
  });
});

// Eliminar un usuario
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Verificar si el usuario existe
  connection.query("SELECT * FROM usuarios WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error("Error al verificar usuario:", error);
      return res.status(500).json({ error: "Error al eliminar usuario" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Eliminar usuario
    const sql = "DELETE FROM usuarios WHERE id = ?";
    
    connection.query(sql, [id], (error, result) => {
      if (error) {
        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ error: "Error al eliminar usuario" });
      }
      res.json({ message: "Usuario eliminado correctamente" });
    });
  });
});

module.exports = router;