import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, imageUrl, warehouseId, totalUnits } = body;

    if (!name || !warehouseId || !totalUnits) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        imageUrl,
      },
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        warehouseId,
        totalUnits: Number(totalUnits),
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create product",
      },
      {
        status: 500,
      },
    );
  }
}
