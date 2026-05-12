type NotificationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function NotificationModal({
  isOpen,
  title,
  message,
  type = "success",
  onClose,
}: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in">
        <div className="mb-4">
          <h2
            className={`text-2xl font-bold ${
              type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {title}
          </h2>
        </div>

        <p className="text-gray-700 mb-6">{message}</p>

        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl text-white font-semibold transition ${
            type === "success"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
