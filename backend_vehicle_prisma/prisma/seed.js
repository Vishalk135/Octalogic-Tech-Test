import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1️⃣ Vehicle Types
  const typesData = [
    { name: 'Hatchback' },
    { name: 'SUV' },
    { name: 'Sedan' },
    { name: 'Bike (Cruiser)' }
  ];

  const createdTypes = {};
  for (const t of typesData) {
    const created = await prisma.vehicleType.upsert({
      where: { name: t.name },
      update: {},
      create: t
    });
    createdTypes[t.name] = created;
  }

  // 2️⃣ Vehicles for each type
  const vehiclesData = [
    // Hatchback
    { name: 'Honda Jazz 2018', description: 'Compact hatchback', vehicleTypeId: createdTypes['Hatchback'].id },
    { name: 'Volkswagen Polo 2020', description: 'Reliable small car', vehicleTypeId: createdTypes['Hatchback'].id },
    
    // SUV
    { name: 'Hyundai Creta 2021', description: 'Compact SUV', vehicleTypeId: createdTypes['SUV'].id },
    { name: 'Mahindra XUV700 2022', description: 'Mid-size SUV', vehicleTypeId: createdTypes['SUV'].id },

    // Sedan
    { name: 'Honda City 2019', description: 'Comfort sedan', vehicleTypeId: createdTypes['Sedan'].id },
    { name: 'Toyota Corolla 2017', description: 'Reliable sedan', vehicleTypeId: createdTypes['Sedan'].id },

    // Bike (Cruiser)
    { name: 'Royal Enfield Classic 350', description: 'Cruiser bike', vehicleTypeId: createdTypes['Bike (Cruiser)'].id }
  ];

  const createdVehicles = {};
  for (const v of vehiclesData) {
    const created = await prisma.vehicle.upsert({
      where: { name: v.name },
      update: {},
      create: v
    });
    createdVehicles[v.name] = created;
  }

  // 3️⃣ Initial Bookings
  await prisma.booking.createMany({
    data: [
      {
        vehicleId: createdVehicles['Honda Jazz 2018'].id,
        customerName: "John Doe",
        customerPhone: "9876543210",
        startDate: new Date("2025-09-20"),
        endDate: new Date("2025-09-23")
      },
      {
        vehicleId: createdVehicles['Hyundai Creta 2021'].id,
        customerName: "Alice Smith",
        customerPhone: "9123456789",
        startDate: new Date("2025-09-25"),
        endDate: new Date("2025-09-28")
      },
      {
        vehicleId: createdVehicles['Honda City 2019'].id,
        customerName: "Bob Lee",
        customerPhone: "9988776655",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-03")
      }
    ]
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
