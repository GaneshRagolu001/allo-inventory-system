"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationModal from "@/components/NotificationModal";

type Warehouse = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    warehouseId: "",
    totalUnits: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  async function fetchWarehouses() {
    const res = await fetch("/api/warehouses");

    const data = await res.json();

    setWarehouses(data);
  }

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setModal({
        isOpen: true,
        title: "Creation Failed",
        message: data.error,
        type: "error",
      });
      return;
    }

    setModal({
      isOpen: true,
      title: "Product Created",
      message: "The product was created successfully.",
      type: "success",
    });

    setFormData({
      name: "",
      imageUrl: "",
      warehouseId: "",
      totalUnits: "",
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Link
        href="/"
        className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        Back Home
      </Link>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>
          <Link
            href="/admin/inventory"
            className="bg-gray-600 text-white px-5 py-3 mb-8 rounded-lg hover:bg-gray-700 transition"
          >
            Manage Inventory
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-300 text-gray-800 rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Image URL
            </label>

            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  imageUrl: e.target.value,
                })
              }
              className="w-full border border-gray-300 text-gray-800 rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Warehouse
            </label>

            <select
              value={formData.warehouseId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  warehouseId: e.target.value,
                })
              }
              className="w-full border border-gray-300  text-gray-600 rounded-lg p-3"
              required
            >
              <option value="">Select Warehouse</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Initial Stock
            </label>

            <input
              type="number"
              value={formData.totalUnits}
              min="1"
              step="1"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalUnits: e.target.value,
                })
              }
              className="w-full border border-gray-300 text-gray-800 rounded-lg p-3"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Create Product
          </button>
        </form>
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
