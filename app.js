require('dotenv').config(); 
console.log("🔥 APP INICIANDO");
const express = require("express");
const mysql = require('mysql2');  
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
}).promise();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando" });
});
app.get('/tareas', async (req, res) => {
     
      try {
    const [rows] = await db.query('SELECT * FROM tareas');
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

app.post('/tareas', async (req, res) => {
    
    try {
    const { titulo } = req.body;


    if (!titulo || !titulo.trim()) {
        return res.status(400).json({ error: "Título vacío" });
    }
       
    const [result] = await db.query(
      'INSERT INTO tareas (titulo) VALUES (?)',
      [titulo]
    );

    res.json({
      id: result.insertId,
      titulo
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en servidor" });
  }
});
 

app.delete('/tareas/:id', async (req, res) => {

    try {
    const id = req.params.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [result] = await db.query(
      'DELETE FROM tareas WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }

    res.json({ mensaje: "Eliminado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en servidor" });
  }
});


app.put('/tareas/:id', async (req, res) => {
 try {
    const id = req.params.id;
    const { hecha } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    if (typeof hecha !== "boolean") {
      return res.status(400).json({ error: "Valor inválido" });
    }

    const [result] = await db.query(
      'UPDATE tareas SET hecha = ? WHERE id = ?',
      [hecha, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No existe" });
    }

    res.json({ mensaje: "Actualizado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
