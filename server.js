const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function conectarDB() {
  try {
    await client.connect();
    db = client.db("paec");
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  }
}

app.get('/api/residuos', async (req, res) => {
  try {
    const residuos = await db.collection('proyecto').find().toArray();
    res.json(residuos);
  } catch (err) {
    console.error('❌ Error en GET:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

app.post('/api/residuos', async (req, res) => {
  try {
    const col = db.collection('proyecto');
    const nuevo = req.body;

    if (!nuevo.nombre || !nuevo.tipoResiduo || !nuevo.cantidadKg || !nuevo.semestre || !nuevo.carrera || !nuevo.puntoRecoleccion) {
      return res.status(400).json({ error: 'Campos incompletos' });
    }

    const total = await col.countDocuments();
    nuevo.id = `R${(total + 1).toString().padStart(3, '0')}`;

    await col.insertOne(nuevo);
    res.status(201).json({ mensaje: 'Residuo insertado' });
  } catch (err) {
    console.error('❌ Error en POST:', err);
    res.status(500).json({ error: 'Error al insertar residuo' });
  }
});

app.delete('/api/residuos/:id', async (req, res) => {
  try {
    const resultado = await db.collection('proyecto').deleteOne({ id: req.params.id });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Residuo no encontrado' });
    }

    res.json({ mensaje: 'Residuo eliminado' });
  } catch (err) {
    console.error('❌ Error en DELETE:', err);
    res.status(500).json({ error: 'Error al eliminar residuo' });
  }
});

app.put('/api/residuos/:id', async (req, res) => {
  try {
    const actualizado = req.body;

    const result = await db.collection('proyecto').updateOne(
      { id: req.params.id },
      { $set: actualizado }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Residuo no encontrado' });
    }

    res.json({ mensaje: 'Residuo actualizado' });
  } catch (err) {
    console.error('❌ Error en PUT:', err);
    res.status(500).json({ error: 'Error al actualizar residuo' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

conectarDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Servidor en puerto: ${port}`);
  });
});
