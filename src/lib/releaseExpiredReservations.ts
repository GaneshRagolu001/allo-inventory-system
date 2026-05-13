import { prisma } from "@/lib/prisma";

export async function releaseExpiredReservations() {
  const expiredReservations = await prisma.reservation.findMany({
    take: 20,
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const reservation of expiredReservations) {
    await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

      const currentReservation = await tx.reservation.findUnique({
        where: {
          id: reservation.id,
        },
      });

      if (!currentReservation || currentReservation.status !== "PENDING") {
        return;
      }

      if (inventory) {
        const updatedReservedUnits = Math.max(
          inventory.reservedUnits - reservation.quantity,
          0,
        );
        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedUnits: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "RELEASED",
        },
      });
    });
  }
}
