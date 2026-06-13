interface Props {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Card({ children, className = "", hover = false, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-slate-200 rounded-2xl shadow-sm ${
        hover ? "hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
