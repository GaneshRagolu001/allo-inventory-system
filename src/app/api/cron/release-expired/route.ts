import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    let releasedCount = 0;

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
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

        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "RELEASED",
          },
        });
      });

      releasedCount++;
    }

    return NextResponse.json({
      success: true,
      releasedReservations: releasedCount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to release reservations",
      },
      {
        status: 500,
      },
    );
  }
}
