const express = require("express");
const connection = require("../config/database");

const router = express.Router();

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

// Editar tarea
router.put("/:id", (req, res) => {
  const { titulo, descripcion, estado, prioridad } = req.body;
  const { id } = req.params;

  const sql = "UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ? WHERE id = ?";
  const values = [titulo, descripcion, estado, prioridad, id];

  connection.query(sql, values, (error, result) => {
    if (error) {
      console.error("Error al editar tarea:", error);
      return res.status(500).json({ error: "Error al editar la tarea" });
    }
    res.json({ message: "Tarea actualizada correctamente" });
  });
});

// Eliminar tarea
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM tareas WHERE id = ?";
  
  connection.query(sql, [id], (error, result) => {
    if (error) {
      console.error("Error al eliminar tarea:", error);
      return res.status(500).json({ error: "Error al eliminar la tarea" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  });
});

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
