import { useEffect, useState } from "react";
import { useToast, type Toast as ToastType } from "@/contexts/ToastContext";

const toastStyles = {
  success: "border-gain bg-gain/10 text-gain",
  error: "border-loss bg-loss/10 text-loss",
  info: "border-accent bg-accent/10 text-accent",
  warning: "border-amber-400 bg-amber-400/10 text-amber-400",
};

const toastIcons = {
  success: "✓",
  error: "✕",
  info: "ⓘ",
  warning: "⚠",
};

interface ToastItemProps {
  toast: ToastType;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200); // Match transition duration
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-200 ${
        toastStyles[toast.type]
      } ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-lg font-bold" aria-hidden="true">
        {toastIcons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="text-sm opacity-70 transition hover:opacity-100"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * ToastContainer component that displays toast notifications
 * Should be placed at the root level of the app
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2 md:right-4 md:top-4"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
