interface TextFieldProps {
  label: string;
  id: string;
  type: string;
  register: any;
  validation?: any;
  error?: string;
  disabled?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  id,
  type,
  register,
  validation,
  error,
  disabled,
}) => {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        className={`w-full h-11 px-3.5 rounded-xl border bg-white text-ink placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent disabled:bg-slate-50 disabled:text-slate-400 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
        id={id}
        type={type}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(id, validation)}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextField;
