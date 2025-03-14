const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Cargar variables de entorno
dotenv.config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Configuración de CORS
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Swagger Config
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestor de Tareas',
      version: '1.0.0',
      description: 'Documentación del API del gestor de tareas',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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
