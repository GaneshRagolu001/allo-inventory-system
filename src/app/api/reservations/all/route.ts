import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/releaseExpiredReservations";

export async function GET() {
  try {
    await releaseExpiredReservations();
    const reservations = await prisma.reservation.findMany({
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch reservations",
      },
      {
        status: 500,
      },
    );
  }
}
