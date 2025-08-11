import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from './generated/prisma'
import emailRoutes from './routes/email';
import 'dotenv/config';
dotenv.config()

const app = express()
const prisma = new PrismaClient()


app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json()) 

const PORT = process.env.PORT || 4000

//Get specific client payments
app.get('/clients/:id/payments', async (req, res) => {
  const clientId = Number(req.params.id);
  try {
    const payments = await prisma.payment.findMany({
      where: { clientId },
      orderBy: { date: 'desc' }, //to order payments by date
    });
    res.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments for client:', error);
    res.status(500).json({ error: 'Failed to fetch payments for client' });
  }
});

//Get specific client
app.get('/clients/:id', (async(req, res) => {
  const clientId = Number(req.params.id);
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { payments: true}
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  res.json(client);
}) as express.RequestHandler); //To solve weird TS bug



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

app.get('/api/payments', async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: { client: true },
  });
  res.json(payments);
});

app.post('/api/payments', async (req, res) => {
  const { clientId, amount, status, date } = req.body;
  const payment = await prisma.payment.create({
    data: { clientId, amount, status, date: new Date(date) },
  });
  res.json(payment);
});

app.delete('/api/payments/:id', async (req, res) => {
  const paymentId = Number(req.params.id);
  try {
    await prisma.payment.delete({ where: { id: paymentId } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete payment error:', error); 
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Payment Status Change
app.put('/api/payments/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedPayment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

app.use('/api/email', emailRoutes);
