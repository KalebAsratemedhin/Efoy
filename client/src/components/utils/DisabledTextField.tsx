interface DisabledTextFieldProps {
    label: string;
    type: string;
    value: any;
  }
  
  const DisabledTextField: React.FC<DisabledTextFieldProps> = ({ label, type, value}) => {
    return (
      <div className="w-full my-4">
        <label className="text-gray-500" htmlFor={label}>{label}</label>
        <input
          className="w-full block border rounded-xl px-2 focus:outline-none focus:ring-purple-400 focus:ring-2 border-gray-300 h-12"
          type={type}
          value={value}
          disabled={true}
          
        />
      </div>
    );
  };
  
  export default DisabledTextField;
  