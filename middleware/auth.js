const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir la información del usuario a la solicitud
    req.usuario = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token no válido' });
  }
};

module.exports = auth;