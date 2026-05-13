import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/releaseExpiredReservations";

export const dynamic = "force-dynamic";

type InventoryItem = {
  warehouseId: string;
  warehouseName: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
};

type Product = {
  id: string;
  name: string;
  imageUrl?: string | null;
  inventory: InventoryItem[];
};

async function getProducts(): Promise<Product[]> {
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

  return products.map((product) => ({
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
}

export default async function Home() {
  const products = await getProducts();
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Inventory System
            </h1>

            <p className="text-gray-600 mt-2">
              Multi-warehouse inventory reservation platform
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/warehouses"
              className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Warehouses
            </Link>
            <Link
              href="/myreservations"
              className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              View Reservations
            </Link>

            <Link
              href="/admin"
              className="bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-60 object-cover"
                />
              ) : (
                <div className="w-full h-60 bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  No Image Available
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-5">
                  {product.name}
                </h2>

                <div className="space-y-4">
                  {product.inventory.map((item) => (
                    <div
                      key={item.warehouseId}
                      className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.warehouseName}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          Available Units:{" "}
                          <span className="font-semibold">
                            {item.availableUnits}
                          </span>
                        </p>
                      </div>

                      {item.availableUnits > 0 ? (
                        <Link
                          href={`/reservation?productId=${product.id}&warehouseId=${item.warehouseId}`}
                          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                        >
                          Reserve
                        </Link>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
