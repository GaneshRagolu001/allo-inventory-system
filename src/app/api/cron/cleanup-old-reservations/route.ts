import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const releasedCleanup = await prisma.reservation.deleteMany({
      where: {
        status: "RELEASED",
        createdAt: {
          lt: oneDayAgo,
        },
      },
    });

    const confirmedCleanup = await prisma.reservation.deleteMany({
      where: {
        status: "CONFIRMED",
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      releasedDeleted: releasedCleanup.count,
      confirmedDeleted: confirmedCleanup.count,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Cleanup operation failed",
      },
      {
        status: 500,
      },
    );
  }
}
