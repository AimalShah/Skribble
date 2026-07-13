import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

const CustomDialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: DialogProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900/95 sketchy-card border-slate-700 shadow-xl max-w-md w-full p-6 relative wobbly-glow mx-4"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-lg font-display font-bold text-yellow-300">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        )}

        <div className="mt-4">{children}</div>

        {footer && <div className="mt-6">{footer}</div>}
      </motion.div>
    </div>
  );
};

export default CustomDialog;
