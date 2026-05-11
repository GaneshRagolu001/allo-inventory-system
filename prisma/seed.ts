import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Delhi Warehouse",
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse",
    },
  });

  const product1 = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "MacBook Air",
    },
  });

  await prisma.inventory.createMany({
    data: [
      {
        productId: product1.id,
        warehouseId: warehouse1.id,
        totalUnits: 5,
      },
      {
        productId: product1.id,
        warehouseId: warehouse2.id,
        totalUnits: 3,
      },
      {
        productId: product2.id,
        warehouseId: warehouse1.id,
        totalUnits: 4,
      },
    ],
  });

  console.log("Seeded database");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });