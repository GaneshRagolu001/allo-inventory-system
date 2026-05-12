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
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
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
            <a
              href="/warehouses"
              className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Warehouses
            </a>
            <a
              href="/myreservations"
              className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              View Reservations
            </a>

            <a
              href="/admin"
              className="bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Admin Panel
            </a>
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
                        <form action="/reservation" method="GET">
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />

                          <input
                            type="hidden"
                            name="warehouseId"
                            value={item.warehouseId}
                          />

                          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                            Reserve
                          </button>
                        </form>
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
