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
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "MacBook Air",
      imageUrl:
        "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-size-select-202601-13inch?wid=5120&hei=3280&fmt=webp&qlt=90&.v=YTFkSnBPS2tMZFdhaFNRRkx6VnJZZ0dOZysray9HQ25xUFBjc1l1SVBQRG5EMTJnc255akxtMmp5bU5mazhOU2llL1JtdmgzcGVIUDRDUVJnTDZxRi9IeW9zeVB5R1dmem9sYTN4ckVUbEpyanpSTU15V20vUHNpYk1hZWg4QjU&traceId=1",
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
