"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

// ---- Types ----

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ---- Provider ----

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // auto-dismiss after 2.5s
    setTimeout(() => {
      // mark exiting for animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      // remove after exit animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 2500);
  }, []);

  const value: ToastContextValue = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — fixed top-center */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
        style={{ maxWidth: "calc(100vw - 2rem)" }}
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---- Hook ----

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // safe fallback (noop) for SSR and edge cases
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}

// ---- Toast Bubble ----

const typeStyles: Record<ToastType, string> = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-500 text-white",
  info: "bg-gray-800 text-white",
};

const typeIcons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

function ToastBubble({ toast }: { toast: ToastItem }) {
  return (
    <div
      className={`
        pointer-events-auto
        px-4 py-2.5 rounded-xl shadow-lg
        text-sm font-medium
        flex items-center gap-2
        whitespace-nowrap
        ${typeStyles[toast.type]}
        ${toast.exiting ? "animate-toast-out" : "animate-toast-in"}
      `}
    >
      <span className="text-base leading-none">{typeIcons[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
