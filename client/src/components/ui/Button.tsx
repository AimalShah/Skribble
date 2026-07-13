import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 sketchy-btn border-indigo-400",
  secondary:
    "bg-yellow-400 text-slate-950 hover:bg-yellow-300 font-bold sketchy-btn border-slate-950",
  outline:
    "border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white",
  ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
  danger: "bg-red-600 text-white hover:bg-red-500 sketchy-btn border-red-400",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500 sketchy-btn border-emerald-400",
  warning:
    "bg-yellow-500 text-slate-950 hover:bg-yellow-400 sketchy-btn border-yellow-600",
  info: "bg-cyan-600 text-white hover:bg-cyan-500 sketchy-btn border-cyan-400",
} as const;

const SIZES = {
  xs: "px-2 py-1 text-xs rounded-lg",
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-base rounded-xl",
  lg: "px-5 py-2.5 text-lg rounded-xl",
  xl: "px-6 py-3 text-xl rounded-2xl",
} as const;

const DISABLED = "opacity-50 cursor-not-allowed";

type ButtonVariant = keyof typeof VARIANTS;
type ButtonSize = keyof typeof SIZES;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  color?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      startIcon,
      endIcon,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          `${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${disabled ? DISABLED : ""} inline-flex items-center justify-center font-bold font-display transition-all duration-200 focus:outline-none cursor-pointer`,
          className
        )}
        disabled={disabled}
        {...rest}
      >
        {startIcon && <span className={children ? "mr-2" : ""}>{startIcon}</span>}
        {children}
        {endIcon && <span className={children ? "ml-2" : ""}>{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
