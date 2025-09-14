import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Vehicle Booking API is running! Use /vehicle_types, /vehicles, or /bookings');
});

// Get all vehicle types (with vehicles)
app.get('/vehicle_types', async (req, res) => {
  try {
    const vehicletypes = await prisma.vehicleType.findMany({
      include: { vehicles: true },
      orderBy: { name: 'asc' }
    });
    res.json(vehicletypes);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all vehicles (filter by typeId if provided)
app.get('/vehicles', async (req, res) => {
  try {
    const { typeId } = req.query;
    const where = typeId ? { vehicleTypeId: Number(typeId) } : {};
    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { vehicleType: true }
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bookings (filter by vehicleId if provided)
app.get('/bookings', async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const where = vehicleId ? { vehicleId: Number(vehicleId) } : {};
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startDate: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a booking
app.post('/bookings', async (req, res) => {
  try {
    const { vehicleId, customerName, customerPhone, startDate, endDate } = req.body;

    if (!vehicleId || !customerName || !startDate || !endDate) {
      return res.status(400).json({ error: 'vehicleId, customerName, startDate, and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ error: 'Invalid date range' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Overlap check
    const overlapping = await prisma.booking.findFirst({
      where: {
        vehicleId: Number(vehicleId),
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } }
        ]
      }
    });

    if (overlapping) {
      return res.status(409).json({ error: 'Vehicle already booked in this period', overlapping });
    }

    const created = await prisma.booking.create({
      data: {
        vehicleId: Number(vehicleId),
        customerName,
        customerPhone,
        startDate: start,
        endDate: end
      }
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
