import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        {
          status: 404,
        },
      );
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "Reservation already processed",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: {
          status: "RELEASED",
        },
      });

      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          reservedUnits: {
            decrement: reservation.quantity,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Reservation released",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to release reservation",
      },
      {
        status: 500,
      },
    );
  }
}
