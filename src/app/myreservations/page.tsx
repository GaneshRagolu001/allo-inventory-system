"use client";

import { useEffect, useState } from "react";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);

  const [currentTime, setCurrentTime] = useState(Date.now());

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
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

  function getRemainingTime(expiresAt: string) {
    const remaining = new Date(expiresAt).getTime() - currentTime;

    if (remaining <= 0) {
      return "Expired";
    }

    const minutes = Math.floor(remaining / 1000 / 60);

    const seconds = Math.floor((remaining / 1000) % 60);

    return `${minutes}m ${seconds}s`;
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

            <p className="mb-2">
              Expires At: {new Date(reservation.expiresAt).toLocaleString()}
            </p>

            <p className="mb-4 font-semibold">
              Time Remaining: {getRemainingTime(reservation.expiresAt)}
            </p>

            {getRemainingTime(reservation.expiresAt) === "Expired" &&
              reservation.status === "PENDING" && (
                <p className="text-red-600 font-bold mb-4">
                  Reservation Expired
                </p>
              )}

            {reservation.status === "PENDING" &&
              getRemainingTime(reservation.expiresAt) !== "Expired" && (
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
