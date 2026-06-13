interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
}

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm active:scale-[0.97]",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.97]",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-[0.97]",
  ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.97]",
  accent: "bg-accent text-white hover:bg-accent-dark shadow-sm active:scale-[0.97]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-2.5 text-base rounded-xl",
};

export default function Button({ variant = "primary", size = "md", className = "", children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
