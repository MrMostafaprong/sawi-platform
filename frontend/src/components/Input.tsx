interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...rest }: Props) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full border rounded-xl px-3 py-2 text-sm transition-all duration-200 placeholder:text-slate-400
          ${error ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"}
          ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...rest }: Props & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={`w-full border rounded-xl px-3 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 resize-none
          ${error ? "border-red-300" : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"}
          ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = "", children, ...rest }: Props & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full border rounded-xl px-3 py-2 text-sm transition-all duration-200 bg-white
          ${error ? "border-red-300" : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"}
          ${className}`}
        {...rest}
      >{children}</select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
