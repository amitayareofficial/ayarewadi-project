require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ayarewadi Backend Running");
});


app.get("/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events");
  res.json(result.rows);
});

app.listen(5000, () => {
  console.log("Server started");
});
