require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
function auth(req, res, next) {

  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Sin token" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch {
      return res.status(401).json({ error: "Token inválido" });
  }
}
app.post("/register", async (req, res) => {

  const { nombre, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
    [nombre, email, hash]
  );

  res.json({ message: "Usuario creado" });
});
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Usuario no existe" });
  }

  const user = rows[0];

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(401).json({ error: "Password incorrecto" });
  }

  const token = jwt.sign(
    { id: user.id, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});
app.get("/tareas", auth, async (req, res) => {

  const [rows] = await db.query(
    "SELECT * FROM tareas WHERE user_id = ?",
    [req.user.id]
  );

  res.json(rows);
});

app.post("/tareas", auth, async (req, res) => {

  const { titulo } = req.body;

  const [result] = await db.query(
    "INSERT INTO tareas (titulo, user_id) VALUES (?, ?)",
    [titulo, req.user.id]
  );
res.json({ id: result.insertId, titulo });
});

app.put("/tareas/:id", auth, async (req, res) => {

  const { id } = req.params;
  const { titulo, hecha } = req.body;

  await db.query(
    "UPDATE tareas SET titulo = COALESCE(?, titulo), hecha = COALESCE(?, hecha) WHERE id = ? AND user_id = ?",
    [titulo, hecha, id, req.user.id]
  );

  res.json({ message: "Actualizado" });
});

app.delete("/tareas/:id", auth, async (req, res) => {

  const { id } = req.params;

  await db.query(
    "DELETE FROM tareas WHERE id = ? AND user_id = ?",
    [id, req.user.id]
  );

  res.json({ message: "Eliminado" });
});
 app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor corriendo 🚀");
});