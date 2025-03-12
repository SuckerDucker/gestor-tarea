const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
    return;
  }
  console.log("Conexión a la base de datos MySQL establecida.");
});

module.exports = connection;
