const API = "https://backend-todo-3d74.onrender.com";

let tareasGlobal = [];
let filtroActual = "todas";

async function cargarTareas() {

  const res = await fetch(`${API}/tareas`);
  tareasGlobal = await res.json();
  renderizar();
}
function renderizar() {
  let data = tareasGlobal;
  if (filtroActual === "pendientes") {
      data = data.filter(t => !t.hecha);
  }
    if (filtroActual === "completadas") {
     data = data.filter(t => t.hecha);
  }

  const lista = document.getElementById("lista");

  lista.innerHTML = "";

  data.forEach(t => {

    const li = document.createElement("li");
    li.style.animation = "fadeIn 0.3s ease";

    const texto = document.createElement("span");
    texto.textContent = t.titulo;
    if (t.hecha) 
      texto.classList.add("done");
    
     const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = t.hecha;

    checkbox.onchange = async () => {
    await fetch(`${API}/tareas/${t.id}`, {
      method: "PUT",
     headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
       hecha: checkbox.checked
        })
      });
    cargarTareas();
    };


    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("btn-edit")
    editBtn.onclick = async () => {

      const nuevoTitulo = prompt("Editar tarea:", t.titulo);

      if (!nuevoTitulo) return;

      await fetch(`${API}/tareas/${t.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo: nuevoTitulo
        })
      });

      cargarTareas();
    };

    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.classList.add("btn-delete"); 
    btn.onclick = async () => {

     li.style.opacity = "0";
     li.style.transform = "translateX(20px)";
     li.style.transition = "0.3s";

      const ok = confirm(
    "¿Seguro que quieres eliminar esta tarea?"
  );
    if (!ok) return;

      await fetch(`${API}/tareas/${t.id}`, {
        method: "DELETE"
      });

      cargarTareas();
    };

    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(editBtn);
    li.appendChild(btn);

    lista.appendChild(li);
  });

  const total = tareasGlobal.length;
  const completadas =
    tareasGlobal.filter(t => t.hecha).length;
    const pendientes =
    total - completadas;

document.getElementById("total").textContent =
  total;

document.getElementById("pendientes").textContent =
  pendientes;

document.getElementById("completadas").textContent =
  completadas;
}
function filtro(tipo) {
  filtroActual = tipo;
   renderizar();
}

async function agregarTarea() {

  const input = document.getElementById("tarea");
  const texto = input.value.trim();

  if (!texto) return;

  await fetch(`${API}/tareas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      titulo: texto
    })
  });

  input.value = "";
  cargarTareas();
}

cargarTareas();