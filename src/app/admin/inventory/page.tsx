"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationModal from "@/components/NotificationModal";

type Inventory = {
  id: string;
  totalUnits: number;
  reservedUnits: number;

  product: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };

  warehouse: {
    id: string;
    name: string;
  };
};

export default function InventoryAdminPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [loading, setLoading] = useState(true);

  const [additionalStock, setAdditionalStock] = useState<
    Record<string, number>
  >({});

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  async function fetchInventory() {
    try {
      const res = await fetch("/api/warehouses", {
        cache: "no-store",
      });

      const data = await res.json();

      const flattened = data.flatMap((warehouse: any) =>
        warehouse.inventory.map((item: any) => ({
          ...item,
          warehouse: {
            id: warehouse.id,
            name: warehouse.name,
          },
        })),
      );

      setInventory(flattened);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  async function addStock(item: Inventory) {
    const quantity = additionalStock[item.id];

    if (!quantity || quantity <= 0) {
      setModal({
        isOpen: true,
        title: "Invalid Quantity",
        message: "Please enter a valid stock amount.",
        type: "error",
      });

      return;
    }

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.product.id,
          warehouseId: item.warehouse.id,
          additionalUnits: quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setModal({
        isOpen: true,
        title: "Stock Updated",
        message: "Inventory updated successfully.",
        type: "success",
      });

      setAdditionalStock((prev) => ({
        ...prev,
        [item.id]: 0,
      }));

      fetchInventory();
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: "Update Failed",
        message: err.message,
        type: "error",
      });
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading inventory...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Inventory Management
            </h1>

            <p className="text-gray-600 mt-2">
              Restock and manage warehouse inventory
            </p>
          </div>

          <Link
            href="/admin"
            className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Back Admin
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="flex">
                <img
                  src={
                    item.product.imageUrl ||
                    "https://via.placeholder.com/300x300"
                  }
                  alt={item.product.name}
                  className="w-40 h-40 object-cover"
                />

                <div className="p-5 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {item.product.name}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4">
                    {item.warehouse.name}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total</p>

                      <p className="font-bold text-gray-900">
                        {item.totalUnits}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Reserved</p>

                      <p className="font-bold text-yellow-600">
                        {item.reservedUnits}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Available</p>

                      <p className="font-bold text-green-600">
                        {item.totalUnits - item.reservedUnits}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      placeholder="Add stock"
                      value={additionalStock[item.id] || ""}
                      onChange={(e) =>
                        setAdditionalStock((prev) => ({
                          ...prev,
                          [item.id]: Number(e.target.value),
                        }))
                      }
                      className="flex-1 border border-gray-300 text-gray-800 rounded-lg px-4 py-2"
                    />

                    <button
                      onClick={() => addStock(item)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NotificationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() =>
          setModal({
            ...modal,
            isOpen: false,
          })
        }
      />
    </main>
  );
}
