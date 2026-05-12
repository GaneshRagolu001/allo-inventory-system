import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reservationSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = reservationSchema.parse(body);

    const { productId, warehouseId, quantity } = validatedData;

    const result = await prisma.$transaction(async (tx) => {
      const expiredReservations = await tx.reservation.findMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      for (const expired of expiredReservations) {
        await tx.inventory.updateMany({
          where: {
            productId: expired.productId,
            warehouseId: expired.warehouseId,
          },
          data: {
            reservedUnits: {
              decrement: expired.quantity,
            },
          },
        });

        await tx.reservation.update({
          where: {
            id: expired.id,
          },
          data: {
            status: "RELEASED",
          },
        });
      }
      const inventoryRows = await tx.$queryRaw<
        {
          id: string;
          totalUnits: number;
          reservedUnits: number;
        }[]
      >`
          SELECT *
          FROM "Inventory"
          WHERE "productId" = ${productId}
          AND "warehouseId" = ${warehouseId}
          FOR UPDATE
        `;

      const inventory = inventoryRows[0];

      if (!inventory) {
        throw new Error("INVENTORY_NOT_FOUND");
      }

      const availableUnits = inventory.totalUnits - inventory.reservedUnits;

      if (availableUnits < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedUnits: {
            increment: quantity,
          },
        },
      });

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: "PENDING",
        },
      });

      return reservation;
    });

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        {
          error: "Not enough stock available",
        },
        {
          status: 409,
        },
      );
    }

    if (error instanceof Error && error.message === "INVENTORY_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Inventory not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create reservation",
      },
      {
        status: 500,
      },
    );
  }
}
