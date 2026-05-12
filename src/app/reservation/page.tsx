"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReservationPage() {
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");

  const warehouseId = searchParams.get("warehouseId");

  const [loading, setLoading] = useState(false);

  const [reservation, setReservation] = useState<any>(null);

  const [error, setError] = useState("");

  async function reserveProduct() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setReservation(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmReservation() {
    if (!reservation) return;

    try {
      const res = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      alert("Reservation confirmed");

      location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function releaseReservation() {
    if (!reservation) return;

    try {
      const res = await fetch(`/api/reservations/${reservation.id}/release`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      alert("Reservation released");

      location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Reservation Checkout</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded mb-4">{error}</div>
      )}

      {!reservation ? (
        <button
          onClick={reserveProduct}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded"
        >
          {loading ? "Reserving..." : "Reserve Product"}
        </button>
      ) : (
        <div className="border rounded-lg p-6 max-w-lg">
          <p className="mb-3">
            Reservation ID:
            {reservation.id}
          </p>

          <p className="mb-3">
            Status:
            {reservation.status}
          </p>

          <p className="mb-6">
            Expires At:
            {new Date(reservation.expiresAt).toLocaleString()}
          </p>

          <div className="flex gap-4">
            <button
              onClick={confirmReservation}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Confirm Purchase
            </button>

            <button
              onClick={releaseReservation}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
