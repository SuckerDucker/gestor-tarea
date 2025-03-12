
const API_URL = 'http://localhost:3000/api';

// Guardamos token y usuario logueado
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

// Elementos del DOM: Auth
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const registroForm = document.getElementById('registro-form');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const mostrarRegistro = document.getElementById('mostrar-registro');
const mostrarLogin = document.getElementById('mostrar-login');

// Elementos del DOM: App
const appContainer = document.getElementById('app-container');
const btnLogout = document.getElementById('btn-logout');
const usuarioNombre = document.getElementById('usuario-nombre');

// Elementos para Tareas
const tareaForm = document.getElementById('tareaForm');
const listaTareas = document.getElementById('listaTareas');
const btnCancelarEdicionTarea = document.getElementById('cancelarEdicionTarea');
const selectUsuario = document.getElementById('usuario_id');

// Elementos para Usuarios
const usuarioForm = document.getElementById('usuarioForm');
const listaUsuarios = document.getElementById('listaUsuarios');
const btnCancelarEdicionUsuario = document.getElementById('cancelarEdicionUsuario');

// Variables de edición
let tareaEnEdicion = null;
let usuarioEnEdicion = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ver si hay token en localStorage
  if (token && usuario) {
    // Intentar verificar el token
    verificarToken();
  } else {
    mostrarAuth();
  }

  // Events para forms de login/registro
  formLogin.addEventListener('submit', iniciarSesion);
  formRegistro.addEventListener('submit', registrarUsuario);

  // Botones "mostrar registro" / "mostrar login"
  mostrarRegistro.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registroForm.style.display = 'block';
  });
  mostrarLogin.addEventListener('click', () => {
    registroForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Botón de logout
  btnLogout.addEventListener('click', cerrarSesion);

  // Tareas
  tareaForm.addEventListener('submit', guardarTarea);
  btnCancelarEdicionTarea.addEventListener('click', cancelarEdicionTarea);

  // Usuarios
  usuarioForm.addEventListener('submit', guardarUsuario);
  btnCancelarEdicionUsuario.addEventListener('click', cancelarEdicionUsuario);
});

// Funciones de Autenticación

async function verificarToken() {
  try {
    const response = await fetch(`${API_URL}/auth/verificar`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    if (data.valido) {
      mostrarApp();
      // Cargar Tareas y Usuarios
      cargarTareas();
      cargarUsuarios();
    } else {
      mostrarAuth();
    }
  } catch (error) {
    console.error('Error al verificar token:', error);
    mostrarAuth();
  }
}

function mostrarAuth() {
  authContainer.style.display = 'block';
  appContainer.style.display = 'none';
  token = null;
  usuario = null;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

function mostrarApp() {
  authContainer.style.display = 'none';
  appContainer.style.display = 'block';
  usuarioNombre.textContent = usuario ? usuario.nombre : '';
}

async function iniciarSesion(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Guardar token y usuario en localStorage
    token = data.token;
    usuario = data.usuario;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    formLogin.reset();
    mostrarApp();
    // Cargar Tareas y Usuarios
    cargarTareas();
    cargarUsuarios();

  } catch (error) {
    console.error('Error de login:', error);
    alert(error.message);
  }
}

async function registrarUsuario(event) {
  event.preventDefault();
  const nombre = document.getElementById('registro-nombre').value;
  const email = document.getElementById('registro-email').value;
  const password = document.getElementById('registro-password').value;

  try {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrarse');
    }

    // Guardar token y usuario
    token = data.token;
    usuario = data.usuario;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    formRegistro.reset();
    mostrarApp();
    // Cargar Tareas y Usuarios
    cargarTareas();
    cargarUsuarios();

    alert('Usuario registrado correctamente');
  } catch (error) {
    console.error('Error de registro:', error);
    alert(error.message);
  }
}

function cerrarSesion() {
  mostrarAuth();
}


// Funciones para Usuarios

async function cargarUsuarios() {
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al cargar usuarios');
    }
    const usuarios = await response.json();
    mostrarUsuarios(usuarios);
    llenarSelectUsuarios(usuarios);
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    alert('Error al cargar usuarios');
  }
}

function mostrarUsuarios(usuarios) {
  listaUsuarios.innerHTML = '';

  if (!usuarios.length) {
    listaUsuarios.innerHTML = `
      <tr><td colspan="4" class="text-center">No hay usuarios</td></tr>
    `;
    return;
  }

  usuarios.forEach(usr => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${usr.id}</td>
      <td>${usr.nombre}</td>
      <td>${usr.email}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarUsuario(${usr.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usr.id})">Eliminar</button>
      </td>
    `;
    listaUsuarios.appendChild(row);
  });
}

function llenarSelectUsuarios(usuarios) {
  selectUsuario.innerHTML = '<option value="">(Selecciona un usuario)</option>';
  usuarios.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.nombre;
    selectUsuario.appendChild(opt);
  });
}

async function guardarUsuario(event) {
  event.preventDefault();
  if (!token) {
    mostrarAuth();
    return;
  }

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    let url = `${API_URL}/usuarios`;
    let method = 'POST';

    if (usuarioEnEdicion) {
      url = `${API_URL}/usuarios/${usuarioEnEdicion}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, email, password })
    });

    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al guardar usuario');
    }

    usuarioForm.reset();
    cancelarEdicionUsuario();
    cargarUsuarios();
    alert(usuarioEnEdicion ? 'Usuario actualizado correctamente' : 'Usuario registrado correctamente');
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    alert(error.message);
  }
}

async function editarUsuario(id) {
  if (!token) {
    mostrarAuth();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al obtener usuario');
    }

    const usr = await response.json();

    document.getElementById('nombre').value = usr.nombre;
    document.getElementById('email').value = usr.email;
    document.getElementById('password').value = '';

    usuarioEnEdicion = id;
    document.getElementById('guardarUsuario').textContent = 'Actualizar';
    btnCancelarEdicionUsuario.classList.remove('d-none');

    // Cambiar a pestaña "usuarios"
    const usuariosTab = document.getElementById('usuarios-tab');
    const bsTab = new bootstrap.Tab(usuariosTab);
    bsTab.show();

    usuarioForm.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    alert('Error al editar usuario');
  }
}

function cancelarEdicionUsuario() {
  usuarioForm.reset();
  usuarioEnEdicion = null;
  document.getElementById('guardarUsuario').textContent = 'Guardar';
  btnCancelarEdicionUsuario.classList.add('d-none');
}

async function eliminarUsuario(id) {
  if (!token) {
    mostrarAuth();
    return;
  }
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al eliminar usuario');
    }
    cargarUsuarios();
    cargarTareas(); // Por si sus tareas se borran
    alert('Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    alert('Error al eliminar usuario');
  }
}


// Funciones para Tareas

async function cargarTareas() {
  if (!token) {
    mostrarAuth();
    return;
  }
  try {
    const response = await fetch(`${API_URL}/tareas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al cargar tareas');
    }
    const tareas = await response.json();
    mostrarTareas(tareas);
  } catch (error) {
    console.error('Error al cargar tareas:', error);
    alert('Error al cargar las tareas');
  }
}

function mostrarTareas(tareas) {
  listaTareas.innerHTML = '';

  if (!tareas.length) {
    listaTareas.innerHTML = '<div class="col-12"><p class="text-center">No hay tareas. ¡Crea una nueva!</p></div>';
    return;
  }

  tareas.forEach(tarea => {
    const prioridadClase =
      tarea.prioridad === 'Alta' ? 'priority-high' :
      tarea.prioridad === 'Media' ? 'priority-medium' :
      'priority-low';

    const tareaHTML = `
      <div class="col-md-6">
        <div class="card task-card ${prioridadClase}">
          <div class="card-body">
            <h5 class="card-title">${tarea.titulo}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Estado: ${tarea.estado} | Prioridad: ${tarea.prioridad}
            </h6>
            <p class="card-text">${tarea.descripcion || 'Sin descripción'}</p>
            <p class="card-text"><strong>Asignada a Usuario:</strong> ${tarea.usuario_id}</p>
            <div class="task-buttons">
              <button class="btn btn-sm btn-warning" onclick="editarTarea(${tarea.id})">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    listaTareas.innerHTML += tareaHTML;
  });
}

async function guardarTarea(event) {
  event.preventDefault();
  if (!token) {
    mostrarAuth();
    return;
  }

  const tarea = {
    titulo: document.getElementById('titulo').value,
    descripcion: document.getElementById('descripcion').value,
    estado: document.getElementById('estado').value,
    prioridad: document.getElementById('prioridad').value,
    usuario_id: document.getElementById('usuario_id').value
  };

  try {
    let url = `${API_URL}/tareas`;
    let method = 'POST';
    if (tareaEnEdicion) {
      url = `${API_URL}/tareas/${tareaEnEdicion}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tarea)
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al guardar tarea');
    }

    tareaForm.reset();
    cancelarEdicionTarea();
    cargarTareas();
    alert(tareaEnEdicion ? 'Tarea actualizada' : 'Tarea agregada');
  } catch (error) {
    console.error('Error al guardar tarea:', error);
    alert('Error al guardar la tarea');
  }
}

async function editarTarea(id) {
  if (!token) {
    mostrarAuth();
    return;
  }
  try {
    const response = await fetch(`${API_URL}/tareas/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al obtener tarea');
    }
    const tarea = await response.json();

    document.getElementById('titulo').value = tarea.titulo;
    document.getElementById('descripcion').value = tarea.descripcion || '';
    document.getElementById('estado').value = tarea.estado;
    document.getElementById('prioridad').value = tarea.prioridad;
    document.getElementById('usuario_id').value = tarea.usuario_id;

    tareaEnEdicion = id;
    document.getElementById('guardarTarea').textContent = 'Actualizar';
    btnCancelarEdicionTarea.classList.remove('d-none');

    tareaForm.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error al editar tarea:', error);
    alert('Error al editar la tarea');
  }
}

function cancelarEdicionTarea() {
  tareaForm.reset();
  tareaEnEdicion = null;
  document.getElementById('guardarTarea').textContent = 'Guardar';
  btnCancelarEdicionTarea.classList.add('d-none');
}

async function eliminarTarea(id) {
  if (!token) {
    mostrarAuth();
    return;
  }
  if (!confirm('¿Seguro que deseas eliminar esta tarea?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tareas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        mostrarAuth();
        return;
      }
      throw new Error('Error al eliminar la tarea');
    }

    if (tareaEnEdicion === id) {
      cancelarEdicionTarea();
    }
    cargarTareas();
    alert('Tarea eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    alert('Error al eliminar la tarea');
  }
}
