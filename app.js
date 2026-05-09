const API = "https://backend-todo-3d74.onrender.com";

async function cargarTareas() {

  const res = await fetch(`${API}/tareas`);
  const data = await res.json();

  const lista = document.getElementById("lista");

  lista.innerHTML = "";

  data.forEach(t => {

    const li = document.createElement("li");
    const texto = document.createElement("span");
    texto.textContent = t.titulo;

    if (t.hecha) {
      texto.classList.add("done");
    }

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
    editBtn.textContent = "Editar";

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
    btn.textContent = "Eliminar";

    btn.onclick = async () => {

      await fetch(`${API}/tareas/${t.id}`, {
        method: "DELETE"
      });

      cargarTareas();
    };

    // AGREGAR AL HTML
    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(editBtn);
    li.appendChild(btn);

    lista.appendChild(li);
  });
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