import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/releaseExpiredReservations";

export async function GET() {
  try {
    await releaseExpiredReservations();
    const products = await prisma.product.findMany({
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl ?? null,
      inventory: product.inventory.map((item) => ({
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse.name,
        totalUnits: item.totalUnits,
        reservedUnits: item.reservedUnits,
        availableUnits: item.totalUnits - item.reservedUnits,
      })),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
