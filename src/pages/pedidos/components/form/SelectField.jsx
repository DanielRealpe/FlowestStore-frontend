"use client"

import { useTheme } from "../../../components/layout/ThemeContext.jsx" // Ajusta la ruta según tu estructura

const SelectField = ({ name, label, value, options, onChange, className = "", icon, error }) => {
  const { darkMode } = useTheme()

  return (
    <div className={`mb-4 ${className}`}>
      <label className={`block mb-1.5 font-medium text-sm ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 z-10">{icon}</div>}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full border rounded-lg p-2.5 text-sm appearance-none transition-all duration-200 ${
            icon ? "pl-9" : ""
          } pr-8 ${
            error
              ? darkMode
                ? "border-red-500 bg-red-900/10 text-red-300 focus:ring-red-500/50"
                : "border-red-500 bg-red-50 text-red-700 focus:ring-red-500/20"
              : darkMode
                ? "bg-gray-800 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                : "bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          } focus:outline-none focus:ring-2`}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className={darkMode ? "bg-gray-800 text-white" : "bg-white text-slate-900"}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-slate-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {error && (
        <p className={`text-xs mt-1.5 flex items-center ${darkMode ? "text-red-300" : "text-red-600"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
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

export default SelectField