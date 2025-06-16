"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./generated/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new prisma_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // parse JSON request bodies
const PORT = process.env.PORT || 4000;
// Simple test route
app.get('/', (req, res) => {
    res.send('Hello from Express + Prisma backend!');
});
// --- CRUD routes for Client example ---
// GET all clients
app.get('/clients', async (req, res) => {
    try {
        const clients = await prisma.client.findMany();
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});
// POST create new client
app.post('/clients', async (req, res) => {
    const data = req.body;
    try {
        const newClient = await prisma.client.create({ data });
        res.status(201).json(newClient);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create client' });
    }
});
// PUT update client by id
app.put('/clients/:id', async (req, res) => {
    const clientId = Number(req.params.id);
    const data = req.body;
    try {
        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data,
        });
        res.json(updatedClient);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update client' });
    }
});
// DELETE client by id
app.delete('/clients/:id', async (req, res) => {
    const clientId = Number(req.params.id);
    try {
        await prisma.client.delete({ where: { id: clientId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete client' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map