import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export default function CustomAlert({ message, type = "success", onClose }) {
  if (!message) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-600",
      closeHoverBg: "hover:bg-green-100"
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
      closeHoverBg: "hover:bg-red-100"
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      iconColor: "text-amber-600",
      closeHoverBg: "hover:bg-amber-100"
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
      closeHoverBg: "hover:bg-blue-100"
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, closeHoverBg } = config[type] || config.info;

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
      <div className={`flex items-start gap-3 ${bgColor} ${borderColor} border-2 rounded-xl shadow-2xl px-6 py-4 max-w-md min-w-[320px]`}>
        <div className={`${iconColor} mt-0.5`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <p className={`flex-1 ${textColor} font-lato font-medium leading-relaxed`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`${textColor} ${closeHoverBg} rounded-lg p-1.5 transition-colors`}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
