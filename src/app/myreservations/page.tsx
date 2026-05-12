"use client";

import { useEffect, useState } from "react";
import NotificationModal from "@/components/NotificationModal";

type Reservation = {
  id: string;
  quantity: number;
  status: string;
  expiresAt: string;

  product: {
    name: string;
    imageUrl?: string | null;
  };

  warehouse: {
    name: string;
  };
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(Date.now());

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

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

    const refreshInterval = setInterval(() => {
      fetchReservations();
    }, 5000);

    let timerInterval: NodeJS.Timeout;

    const hasPendingReservations = reservations.some(
      (reservation) => reservation.status === "PENDING",
    );

    if (hasPendingReservations) {
      timerInterval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }

    return () => {
      clearInterval(refreshInterval);

      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [reservations]);

  function getRemainingTime(expiresAt: string) {
    const remaining = new Date(expiresAt).getTime() - currentTime;

    if (remaining <= 0) {
      return "Expired";
    }

    const minutes = Math.floor(remaining / 1000 / 60);

    const seconds = Math.floor((remaining / 1000) % 60);

    return `${minutes}m ${seconds}s`;
  }

  async function confirmReservation(id: string) {
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setModal({
        isOpen: true,
        title: "Reservation Confirmed",
        message: "The reservation has been successfully confirmed.",
        type: "success",
      });

      fetchReservations();
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: "Action Failed",
        message: err.message,
        type: "error",
      });
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

      setModal({
        isOpen: true,
        title: "Reservation Cancelled",
        message: "The reservation has been successfully released.",
        type: "success",
      });
      fetchReservations();
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: "Action Failed",
        message: err.message,
        type: "error",
      });
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading reservations...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reservations</h1>

            <p className="text-gray-600 mt-2">
              Manage and track all active inventory reservations
            </p>
          </div>

          <a
            href="/"
            className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Back Home
          </a>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Reservations Found
            </h2>

            <p className="text-gray-600">
              Start reserving products to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200"
              >
                <div className="flex">
                  <img
                    src={
                      reservation.product.imageUrl ||
                      "https://via.placeholder.com/300x300?text=No+Image"
                    }
                    alt={reservation.product.name}
                    className="w-40 h-40 object-cover"
                  />

                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {reservation.product.name}
                        </h2>

                        <p className="text-sm text-gray-600 mt-1">
                          {reservation.warehouse.name}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reservation.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : reservation.status === "RELEASED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Quantity</p>

                        <p className="font-semibold text-gray-900">
                          {reservation.quantity}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Remaining</p>

                        <p
                          className={`font-bold ${
                            getRemainingTime(reservation.expiresAt) ===
                            "Expired"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {getRemainingTime(reservation.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Reservation ID</p>

                        <p className="text-xs text-gray-700 truncate">
                          {reservation.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Expires At</p>

                        <p className="text-xs text-gray-700">
                          {new Date(reservation.expiresAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {reservation.status === "PENDING" &&
                      getRemainingTime(reservation.expiresAt) !== "Expired" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => confirmReservation(reservation.id)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium cursor-pointer"
                          >
                            Confirm
                          </button>

                          <button
                            onClick={() => releaseReservation(reservation.id)}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                    {getRemainingTime(reservation.expiresAt) === "Expired" &&
                      reservation.status === "PENDING" && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm">
                          Reservation expired
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
