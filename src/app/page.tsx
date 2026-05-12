async function getProducts() {
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Inventory System</h1>

          <a
            href="/reservations"
            className="bg-black text-white px-4 py-2 rounded"
          >
            View Reservations
          </a>
        </div>

        <div className="grid gap-6">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">{product.name}</h2>

              <div className="space-y-3">
                {product.inventory.map((item: any) => (
                  <div
                    key={item.warehouseId}
                    className="flex items-center justify-between border p-4 rounded"
                  >
                    <div>
                      <p className="font-medium">{item.warehouseName}</p>

                      <p>Available Units: {item.availableUnits}</p>
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

                        <button className="bg-black text-white px-4 py-2 rounded cursor-pointer">
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
          ))}
        </div>
      </div>
    </main>
  );
}
