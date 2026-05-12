async function getWarehouses() {
  const res = await fetch("http://localhost:3000/api/warehouses", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch warehouses");
  }

  return res.json();
}

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Warehouses</h1>

          <a href="/" className="bg-black text-white px-5 py-3 rounded-lg">
            Back Home
          </a>
        </div>

        <div className="grid gap-8">
          {warehouses.map((warehouse: any) => (
            <div
              key={warehouse.id}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {warehouse.name}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouse.inventory.map((item: any) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <img
                      src={
                        item.product.imageUrl ||
                        "https://via.placeholder.com/400x300"
                      }
                      alt={item.product.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.product.name}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-700">
                      <p>Total Units: {item.totalUnits}</p>

                      <p>Reserved: {item.reservedUnits}</p>

                      <p>
                        Available:{" "}
                        <span className="font-semibold">
                          {item.totalUnits - item.reservedUnits}
                        </span>
                      </p>
                    </div>
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
