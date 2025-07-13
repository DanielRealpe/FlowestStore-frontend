"use client"

const SelectField = ({ name, label, value, options, onChange, className = "", icon }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-gray-300 mb-1.5 font-medium text-sm">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">{icon}</div>}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-2 ${icon ? "pl-9" : ""} focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition-all duration-200 text-sm`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default SelectField
