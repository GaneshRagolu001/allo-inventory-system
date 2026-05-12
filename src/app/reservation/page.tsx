"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationModal from "@/components/NotificationModal";

type Reservation = {
  id: string;
  status: string;
  expiresAt: string;
};

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get("productId");

  const warehouseId = searchParams.get("warehouseId");

  const [loading, setLoading] = useState(false);

  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(Date.now());

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function getRemainingTime(expiresAt: string) {
    const remaining = new Date(expiresAt).getTime() - currentTime;

    if (remaining <= 0) {
      return "Expired";
    }

    const minutes = Math.floor(remaining / 1000 / 60);

    const seconds = Math.floor((remaining / 1000) % 60);

    return `${minutes}m ${seconds}s`;
  }

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

      router.push("/myreservations");
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

      router.push("/myreservations");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Reservation Checkout
            </h1>

            <p className="text-gray-600 mt-2">
              Secure your product inventory before checkout
            </p>
          </div>

          <Link
            href="/"
            className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Back Home
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!reservation ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to reserve this product?
            </h2>

            <p className="text-gray-600 mb-8">
              Your reservation will hold inventory temporarily until payment
              confirmation.
            </p>

            <button
              onClick={reserveProduct}
              disabled={loading}
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Reserving..." : "Reserve Product"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Reservation Created
                </h2>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
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

              <div className="space-y-4 text-gray-700 mb-8">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-500">Reservation ID</p>

                  <p className="font-medium break-all">{reservation.id}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-500">Expires At</p>

                  <p className="font-medium">
                    {new Date(reservation.expiresAt).toLocaleString()}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-500">Time Remaining</p>

                  <p
                    className={`font-bold text-lg ${
                      getRemainingTime(reservation.expiresAt) === "Expired"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {getRemainingTime(reservation.expiresAt)}
                  </p>
                </div>
              </div>

              {getRemainingTime(reservation.expiresAt) === "Expired" ? (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">
                  This reservation has expired. Inventory will be released
                  automatically.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={confirmReservation}
                    className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition font-semibold cursor-pointer"
                  >
                    Confirm Purchase
                  </button>

                  <button
                    onClick={releaseReservation}
                    className="flex-1 bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition font-semibold cursor-pointer"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
