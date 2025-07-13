"use client"

const FormField = ({
  type = "text",
  name,
  label,
  value,
  error,
  onChange,
  icon,
  disabled = false,
  maxLength,
  pattern,
  inputMode,
}) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-gray-300 mb-1.5 font-medium text-sm">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        {type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-gray-800 text-white border ${
              error ? "border-red-500" : "border-gray-700"
            } rounded-lg ${icon ? "pl-10" : "pl-3"} p-2.5 resize-none h-24`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            maxLength={maxLength}
            pattern={pattern}
            inputMode={inputMode}
            className={`w-full bg-gray-800 text-white border ${
              error ? "border-red-500" : "border-gray-700"
            } rounded-lg ${icon ? "pl-10" : "pl-3"} p-2.5`}
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default FormField
