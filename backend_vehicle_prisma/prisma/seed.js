// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Vehicle types
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

  // Vehicles
  const vehicles = [
    { name: 'Honda Jazz 2018', description: 'Compact hatchback', vehicleTypeId: createdTypes['Hatchback'].id },
    { name: 'Volkswagen Polo 2020', description: 'Reliable small car', vehicleTypeId: createdTypes['Hatchback'].id },

    { name: 'Hyundai Creta 2021', description: 'Compact SUV', vehicleTypeId: createdTypes['SUV'].id },
    { name: 'Mahindra XUV700 2022', description: 'Mid-size SUV', vehicleTypeId: createdTypes['SUV'].id },

    { name: 'Honda City 2019', description: 'Comfort sedan', vehicleTypeId: createdTypes['Sedan'].id },
    { name: 'Toyota Corolla 2017', description: 'Reliable sedan', vehicleTypeId: createdTypes['Sedan'].id },

    { name: 'Royal Enfield Classic 350', description: 'Cruiser bike', vehicleTypeId: createdTypes['Bike (Cruiser)'].id }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { name: v.name },
      update: {},
      create: v
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
