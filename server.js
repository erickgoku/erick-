const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Cargar archivo .env

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cliente MongoDB Atlas
const client = new MongoClient(process.env.MONGODB_URI);

// 👉 Ruta: Obtener todos los alumnos
app.get('/api/alumnos', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(); // Usa la base de datos de la URI
    const alumnos = await db.collection('proyecto').find().toArray();
    res.json(alumnos);
  } catch (err) {
    console.error('❌ Error en GET:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// 👉 Ruta: Alta de un nuevo alumno
app.post('/api/alumnos', async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const col = db.collection('proyecto');

    const nuevo = req.body;
    if (!nuevo.nombre || !nuevo.carrera || !nuevo.tipoResiduo || !nuevo.cantidadKg || !nuevo.semestre) {
      return res.status(400).json({ error: 'Campos incompletos' });
    }

    // Asignar un ID tipo A001, A002...
    const total = await col.countDocuments();
    nuevo.id = `A${(total + 1).toString().padStart(3, '0')}`;

    await col.insertOne(nuevo);
    res.status(201).json({ mensaje: 'Alumno insertado' });
  } catch (err) {
    console.error('❌ Error en POST:', err);
    res.status(500).json({ error: 'Error al insertar alumno' });
  }
});

// 👉 Ruta: Eliminar alumno por ID
app.delete('/api/alumnos/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const resultado = await db.collection('proyecto').deleteOne({ id: req.params.id });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    res.json({ mensaje: 'Alumno eliminado' });
  } catch (err) {
    console.error('❌ Error en DELETE:', err);
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
});

// 👉 Ruta: Actualizar alumno por ID
app.put('/api/alumnos/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const actualizado = req.body;

    const result = await db.collection('proyecto').updateOne(
      { id: req.params.id },
      { $set: actualizado }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    res.json({ mensaje: 'Alumno actualizado' });
  } catch (err) {
    console.error('❌ Error en PUT:', err);
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
});

// 👉 Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🟢 Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${port}`);
});
