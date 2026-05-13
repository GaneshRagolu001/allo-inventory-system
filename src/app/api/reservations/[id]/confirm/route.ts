import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

    if (new Date() > reservation.expiresAt) {
      return NextResponse.json(
        {
          error: "Reservation expired",
        },
        {
          status: 410,
        },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: {
          status: "CONFIRMED",
        },
      });

      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          totalUnits: {
            decrement: reservation.quantity,
          },
          reservedUnits: {
            decrement: reservation.quantity,
          },
        },
      });
    });

    revalidatePath("/");
    return NextResponse.json({
      message: "Reservation confirmed",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to confirm reservation",
      },
      {
        status: 500,
      },
    );
  }
}
