"use client";

import { useEffect, useState } from "react";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function fetchReservations() {
    try {
      const res = await fetch("/api/reservations/all", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setReservations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  async function confirmReservation(id: string) {
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      fetchReservations();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function releaseReservation(id: string) {
    try {
      const res = await fetch(`/api/reservations/${id}/release`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      fetchReservations();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Reservations</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded mb-4">{error}</div>
      )}

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">
              {reservation.product.name}
            </h2>

            <p className="mb-1">Warehouse: {reservation.warehouse.name}</p>

            <p className="mb-1">Quantity: {reservation.quantity}</p>

            <p className="mb-1">Status: {reservation.status}</p>

            <p className="mb-4">
              Expires: {new Date(reservation.expiresAt).toLocaleString()}
            </p>

            {reservation.status === "PENDING" && (
              <div className="flex gap-4">
                <button
                  onClick={() => confirmReservation(reservation.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>

                <button
                  onClick={() => releaseReservation(reservation.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
