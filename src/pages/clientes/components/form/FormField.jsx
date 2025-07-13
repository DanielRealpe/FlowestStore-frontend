"use client"

const FormField = ({ type, name, label, value, error, onChange, className = "", icon }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-gray-300 mb-1.5 font-medium text-sm">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">{icon}</div>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-800 text-white border ${
            error ? "border-red-500" : "border-gray-700"
          } rounded-lg p-2 ${icon ? "pl-9" : ""} focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField

