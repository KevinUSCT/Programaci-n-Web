/* =========================================================
   Cali Vigilante — script.js
   Lógica compartida por index.html, reportar.html y casos.html
   ========================================================= */

/* ---------- 1. Persistencia de casos con localStorage ---------- */
const CASOS_KEY = 'casos';

function obtenerCasos() {
  const datos = localStorage.getItem(CASOS_KEY);
  return datos ? JSON.parse(datos) : [];
}

function guardarCasos(casos) {
  localStorage.setItem(CASOS_KEY, JSON.stringify(casos));
}

function agregarCaso(caso) {
  const casos = obtenerCasos();
  casos.push({ ...caso, id: Date.now() });
  guardarCasos(casos);
  return casos;
}

function nombreAutoridad(valor) {
  const nombres = {
    policia: 'Policía Nacional',
    esmad: 'ESMAD',
    ejercito: 'Ejército',
    otra: 'Otra autoridad',
  };
  return nombres[valor] || valor;
}

/* ---------- 2. Construcción y render de tarjetas ---------- */
function crearTarjetaCaso(caso) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-caso';
  tarjeta.innerHTML = `
    <h3>${caso.lugar}</h3>
    <p class="meta">${caso.fecha} · ${nombreAutoridad(caso.autoridad)}</p>
    <p>${caso.descripcion}</p>
  `;
  return tarjeta;
}

function renderizarCasos(casos, contenedor) {
  if (!contenedor) return;
  contenedor.innerHTML = '';

  if (casos.length === 0) {
    contenedor.innerHTML = '<p class="sin-casos">Aún no hay casos registrados.</p>';
    return;
  }

  casos.forEach(caso => contenedor.appendChild(crearTarjetaCaso(caso)));
}

/* ---------- 3. Contador dinámico en el header ---------- */
function actualizarContador() {
  const contador = document.getElementById('contador-casos');
  if (!contador) return;
  const total = obtenerCasos().length;
  contador.textContent = `${total} caso${total === 1 ? '' : 's'} registrado${total === 1 ? '' : 's'}`;
}

/* ---------- 4. Modo oscuro ---------- */
const botonTema = document.getElementById('boton-tema');

function actualizarBotonTema() {
  if (!botonTema) return;
  const modoOscuroActivo = document.body.classList.contains('dark-mode');
  botonTema.textContent = modoOscuroActivo ? '☀️ Modo claro' : '🌙 Modo oscuro';
  botonTema.setAttribute('aria-pressed', modoOscuroActivo);
}

(function inicializarTema() {
  const temaGuardado = localStorage.getItem('tema');

  if (temaGuardado === 'oscuro') {
    document.body.classList.add('dark-mode');
  } else if (!temaGuardado && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Reto opcional: si nunca ha elegido, respetar la preferencia del sistema operativo
    document.body.classList.add('dark-mode');
  }

  actualizarBotonTema();
})();

if (botonTema) {
  botonTema.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    actualizarBotonTema();
    const modoOscuroActivo = document.body.classList.contains('dark-mode');
    localStorage.setItem('tema', modoOscuroActivo ? 'oscuro' : 'claro');
  });
}

/* ---------- 5. Página: index.html (formulario rápido) ---------- */
const formularioRapido = document.getElementById('form-reporte');

if (formularioRapido) {
  const contenedorCasos = document.getElementById('contenedor-casos');
  renderizarCasos(obtenerCasos(), contenedorCasos);
  actualizarContador();

  formularioRapido.addEventListener('submit', function (evento) {
    evento.preventDefault(); // evita que la página se recargue

    const nuevoCaso = {
      fecha: document.getElementById('fecha').value,
      lugar: document.getElementById('lugar').value,
      descripcion: document.getElementById('descripcion').value,
      autoridad: document.getElementById('autoridad').value,
    };

    const casos = agregarCaso(nuevoCaso);
    renderizarCasos(casos, contenedorCasos);
    actualizarContador();
    formularioRapido.reset();
  });
}

/* ---------- 6. Página: reportar.html (formulario con validaciones) ---------- */
const formularioCompleto = document.getElementById('form-reportar-completo');

if (formularioCompleto) {
  actualizarContador();

  const lugarInput = document.getElementById('r-lugar');
  const mensajeExito = document.getElementById('mensaje-exito');

  // Mensaje de error personalizado con setCustomValidity
  lugarInput.addEventListener('input', function () {
    lugarInput.setCustomValidity('');
  });
  lugarInput.addEventListener('invalid', function () {
    lugarInput.setCustomValidity(
      'Escribe el barrio o comuna (mínimo 3 caracteres, solo letras, números y espacios).'
    );
  });

  formularioCompleto.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (!formularioCompleto.checkValidity()) {
      formularioCompleto.reportValidity();
      return;
    }

    const nuevoCaso = {
      fecha: document.getElementById('r-fecha').value,
      lugar: document.getElementById('r-lugar').value,
      descripcion: document.getElementById('r-descripcion').value,
      autoridad: document.getElementById('r-autoridad').value,
    };

    agregarCaso(nuevoCaso);
    actualizarContador();
    formularioCompleto.reset();

    if (mensajeExito) {
      mensajeExito.hidden = false;
      setTimeout(() => { mensajeExito.hidden = true; }, 4000);
    }
  });
}

/* ---------- 7. Página: casos.html (lista, búsqueda, filtro y orden) ---------- */
const contenedorTodosCasos = document.getElementById('contenedor-todos-casos');

if (contenedorTodosCasos) {
  const inputBusqueda = document.getElementById('buscar-caso');
  const selectFiltro = document.getElementById('filtro-autoridad');
  const botonOrdenar = document.getElementById('boton-ordenar');
  let ordenDescendente = true;

  actualizarContador();

  function obtenerCasosFiltrados() {
    let casos = obtenerCasos();

    const termino = inputBusqueda.value.trim().toLowerCase();
    if (termino) {
      casos = casos.filter(caso =>
        caso.lugar.toLowerCase().includes(termino) ||
        caso.descripcion.toLowerCase().includes(termino)
      );
    }

    const autoridad = selectFiltro.value;
    if (autoridad !== 'todas') {
      casos = casos.filter(caso => caso.autoridad === autoridad);
    }

    casos = [...casos].sort((a, b) =>
      ordenDescendente
        ? new Date(b.fecha) - new Date(a.fecha)
        : new Date(a.fecha) - new Date(b.fecha)
    );

    return casos;
  }

  function actualizarLista() {
    renderizarCasos(obtenerCasosFiltrados(), contenedorTodosCasos);
  }

  inputBusqueda.addEventListener('input', actualizarLista);
  selectFiltro.addEventListener('change', actualizarLista);

  botonOrdenar.addEventListener('click', function () {
    ordenDescendente = !ordenDescendente;
    botonOrdenar.textContent = ordenDescendente
      ? '⬇️ Más recientes primero'
      : '⬆️ Más antiguas primero';
    actualizarLista();
  });

  actualizarLista();
}

// URL base de la API simulada
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const formulario = document.getElementById('form-reporte');
//----------------------------post--------------------------------
formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const nuevoCaso = {
    title: document.getElementById('lugar').value,
    body: document.getElementById('descripcion').value,
    autoridad: document.getElementById('autoridad').value,
    fecha: document.getElementById('fecha').value,
  };

  try {

    //armamos un registro de lo que le vamos enviar al servidor
    const respuesta = await fetch(API_URL, {
      method: 'POST',                                 // <-- aquí está la diferencia con GET
      headers: {
        'Content-Type': 'application/json',           // le decimos al servidor qué formato enviamos
      },
      body: JSON.stringify(nuevoCaso),                 // convertimos el objeto JS a texto JSON
    });
    //Chequear estado de la "promesa"
    if (!respuesta.ok) {
      throw new Error(`Error al enviar: ${respuesta.status}`);
    }


    const casoConfirmado = await respuesta.json();
    console.log('El servidor respondió con:', casoConfirmado);

    // JSONPlaceholder no guarda datos de verdad, pero SÍ nos devuelve
    // el objeto con un id simulado, como si lo hubiera guardado.
    contenedorCasos.prepend(crearTarjetaCasoDesdeAPI(casoConfirmado));

    formulario.reset();

  } catch (error) {
    alert('Hubo un problema enviando el reporte. Intenta de nuevo.');
    console.error(error);
  }
});

//---------------------get---------------------------
async function obtenerCasosDelServidor() {
  try {
    // fetch() realiza una petición HTTP. Por defecto, el método es GET.
    const respuesta = await fetch(`${API_URL}?_limit=6`);

    // .ok indica si el servidor respondió con un código de éxito (200-299)
    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }

    // Los datos llegan como texto; .json() los convierte a objetos JavaScript
    const datos = await respuesta.json();
    return datos;

  } catch (error) {
    console.error('No se pudieron obtener los casos:', error);
    return [];
  }
}

function crearTarjetaCasoDesdeAPI(item) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-caso';
  tarjeta.innerHTML = `
    <h3>Caso #${item.id}</h3>
    <p class="meta">Sincronizado desde el servidor</p>
    <p>${item.title}</p>
  `;
  return tarjeta;
}
//-----------------------------------------------------------------------

async function iniciarListaDesdeServidor() {
  const contenedor = document.getElementById('contenedor-casos');
  contenedor.innerHTML = '<p>Cargando casos del servidor...</p>';

  const casosServidor = await obtenerCasosDelServidor();

  contenedor.innerHTML = '';
  casosServidor.forEach(item => {
    contenedor.appendChild(crearTarjetaCasoDesdeAPI(item));
  });
}

iniciarListaDesdeServidor();