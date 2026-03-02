interface TextFieldProps {
    label: string;
    id: string;
    type: string;
    register: any;
    validation?: any;
    error?: string;
    disabled?: boolean;
  }
  
  const TextField: React.FC<TextFieldProps> = ({ label, id, type, register, validation, error, disabled}) => {
    return (
      <div className="w-full my-4">
        <label className="text-gray-500" htmlFor={id}>{label}</label>
        <input
          className="w-full block border rounded-xl px-2 focus:outline-none focus:ring-purple-400 focus:ring-2 border-gray-300 h-12"
          id={id}
          type={type}
          disabled={disabled}
          {...register(id, validation)}
        />
        {error && <p className="text-red-500 text-base mt-1">{error}</p>}
      </div>
    );
  };
  
  export default TextField;
  