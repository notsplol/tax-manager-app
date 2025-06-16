import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from './generated/prisma'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json()) 

const PORT = process.env.PORT || 4000

//temp
app.get('/test-insert', async (req, res) => {
  const test = await prisma.client.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
    },
  });
  res.json(test);
});

// --- CRUD routes for Client example ---
// GET all clients
app.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany()
    res.json(clients)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})



// POST create new client
app.post('/clients', async (req, res) => {
  const data = req.body
  console.log('Received client data:', data);

  if (data.phone === '') {
  data.phone = null;
}

  try {
    const newClient = await prisma.client.create({ data })
    res.status(201).json(newClient)
  } catch (error) {
    console.error('Failed to create client:', error);
    res.status(500).json({ error: 'Failed to create client' })
  }
})

// PUT update client by id
app.put('/clients/:id', async (req, res) => {
  const clientId = Number(req.params.id)
  const data = req.body
  try {
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data,
    })
    res.json(updatedClient)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' })
  }
})

// DELETE client by id
app.delete('/clients/:id', async (req, res) => {
  const clientId = Number(req.params.id)
  try {
    await prisma.client.delete({ where: { id: clientId } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})