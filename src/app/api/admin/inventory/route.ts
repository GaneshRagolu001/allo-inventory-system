import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { productId, warehouseId, additionalUnits } = body;

    const inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId,
      },
    });

    if (!inventory) {
      return NextResponse.json(
        {
          error: "Inventory record not found",
        },
        {
          status: 404,
        },
      );
    }

    const updatedInventory = await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        totalUnits: {
          increment: Number(additionalUnits),
        },
      },
    });

    return NextResponse.json({
      success: true,
      updatedInventory,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update inventory",
      },
      {
        status: 500,
      },
    );
  }
}
