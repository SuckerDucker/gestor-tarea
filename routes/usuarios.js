const express = require("express");
const connection = require("../config/database");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error de validación o email existente
 *       500:
 *         description: Error al registrar usuario
 */
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

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios (sin contraseñas)
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error al obtener usuarios
 */
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

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene la información de un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el usuario
 */
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

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar usuario
 */
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

    connection.query(sql, values, (error) => {
      if (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({ error: "Error al actualizar usuario" });
      }
      res.json({ message: "Usuario actualizado correctamente" });
    });
  });
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar usuario
 */
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
    
    connection.query(sql, [id], (error) => {
      if (error) {
        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ error: "Error al eliminar usuario" });
      }
      res.json({ message: "Usuario eliminado correctamente" });
    });
  });
});

module.exports = router;
