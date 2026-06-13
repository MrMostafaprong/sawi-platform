interface Props {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "danger" | "warning" | "accent";
  size?: "sm" | "md";
  className?: string;
}

const VARIANTS = {
  default: "bg-slate-100 text-slate-700",
  primary: "bg-primary-50 text-primary",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-700",
  accent: "bg-accent/10 text-accent",
};

const SIZES = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({ children, variant = "default", size = "sm", className = "" }: Props) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </span>
  );
}
