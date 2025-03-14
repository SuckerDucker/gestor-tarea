const express = require("express");
const connection = require("../config/database");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tareas
 *   description: Endpoints para la gestión de tareas
 */

/**
 * @swagger
 * /tareas:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tareas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, En Progreso, Completada]
 *               prioridad:
 *                 type: string
 *                 enum: [Baja, Media, Alta]
 *               usuario_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tarea añadida correctamente
 *       400:
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error al agregar la tarea
 */
// Agregar tarea
router.post("/", (req, res) => {
  const { titulo, descripcion, estado, prioridad, usuario_id } = req.body;

  if (!titulo || !usuario_id) {
    return res.status(400).json({ error: "El título y el usuario son obligatorios." });
  }

  const sql = "INSERT INTO tareas (titulo, descripcion, estado, prioridad, usuario_id) VALUES (?, ?, ?, ?, ?)";
  const values = [titulo, descripcion, estado || "Pendiente", prioridad || "Media", usuario_id];

  connection.query(sql, values, (error, result) => {
    if (error) {
      console.error("Error al agregar tarea:", error);
      return res.status(500).json({ error: "Error al agregar la tarea" });
    }
    res.status(201).json({ message: "Tarea añadida correctamente", id: result.insertId });
  });
});

/**
 * @swagger
 * /tareas/{id}:
 *   put:
 *     summary: Actualiza una tarea por su ID
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, En Progreso, Completada]
 *               prioridad:
 *                 type: string
 *                 enum: [Baja, Media, Alta]
 *     responses:
 *       200:
 *         description: Tarea actualizada correctamente
 *       500:
 *         description: Error al editar la tarea
 */
// Editar tarea
router.put("/:id", (req, res) => {
  const { titulo, descripcion, estado, prioridad } = req.body;
  const { id } = req.params;

  const sql = "UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ? WHERE id = ?";
  const values = [titulo, descripcion, estado, prioridad, id];

  connection.query(sql, values, (error) => {
    if (error) {
      console.error("Error al editar tarea:", error);
      return res.status(500).json({ error: "Error al editar la tarea" });
    }
    res.json({ message: "Tarea actualizada correctamente" });
  });
});

/**
 * @swagger
 * /tareas/{id}:
 *   delete:
 *     summary: Elimina una tarea por su ID
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarea eliminada correctamente
 *       500:
 *         description: Error al eliminar tarea
 */
// Eliminar tarea
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM tareas WHERE id = ?";
  
  connection.query(sql, [id], (error) => {
    if (error) {
      console.error("Error al eliminar tarea:", error);
      return res.status(500).json({ error: "Error al eliminar la tarea" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  });
});

/**
 * @swagger
 * /tareas:
 *   get:
 *     summary: Obtiene todas las tareas
 *     tags: [Tareas]
 *     responses:
 *       200:
 *         description: Lista de todas las tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   estado:
 *                     type: string
 *                   prioridad:
 *                     type: string
 *                   usuario_id:
 *                     type: integer
 */
// Obtener todas las tareas
router.get("/", (req, res) => {
  const sql = "SELECT * FROM tareas";
  
  connection.query(sql, (error, results) => {
    if (error) {
      console.error("Error al obtener tareas:", error);
      return res.status(500).json({ error: "Error al obtener las tareas" });
    }
    res.json(results);
  });
});

/**
 * @swagger
 * /tareas/{id}:
 *   get:
 *     summary: Obtiene una tarea específica por su ID
 *     tags: [Tareas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objeto tarea con sus datos
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error al obtener la tarea
 */
// Obtener una tarea por su ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM tareas WHERE id = ?";
  
  connection.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error al obtener tarea:", error);
      return res.status(500).json({ error: "Error al obtener la tarea" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    
    res.json(results[0]);
  });
});

module.exports = router;
