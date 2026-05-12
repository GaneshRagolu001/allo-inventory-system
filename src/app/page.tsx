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
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory System</h1>
      <a href="/myreservations" className="underline mb-6 inline-block">
        View Reservations
      </a>
      ;
      <div className="grid gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="border rounded-lg p-6 shadow">
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

                  <form action="/reservation" method="GET">
                    <input type="hidden" name="productId" value={product.id} />

                    <input
                      type="hidden"
                      name="warehouseId"
                      value={item.warehouseId}
                    />

                    <button className="bg-black text-white px-4 py-2 rounded cursor-pointer">
                      Reserve
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
