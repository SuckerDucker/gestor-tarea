const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: '*', // Acepta peticiones desde cualquier origen
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));



app.use(cors(corsOptions));
app.use(express.json());

// Importar rutas
const tareasRoutes = require("./routes/tareas");
const usuariosRoutes = require("./routes/usuarios");
const authRoutes = require("./routes/auth");

// Usar rutas
app.use("/api/tareas", tareasRoutes);    
app.use("/api/usuarios", usuariosRoutes); 
app.use("/api/auth", authRoutes);

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Gestor de Tareas" });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
