"use client"

import React from "react"

import { CheckCircle } from "lucide-react"

const SuccessMessage = ({ message, onClose, autoClose = true, duration = 3000 }) => {
  // Si autoClose es true, cerrar automáticamente después de duration ms
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className="bg-green-900 text-white p-4 rounded-lg shadow-lg border border-green-500 flex items-center max-w-md">
        <CheckCircle size={20} className="text-green-400 mr-3 flex-shrink-0" />
        <div className="flex-1">{message}</div>
        {onClose && (
          <button onClick={onClose} className="ml-3 text-green-300 hover:text-white focus:outline-none flex-shrink-0">
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default SuccessMessage