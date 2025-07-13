import { AlertTriangle, CheckCircle, Info } from "lucide-react"

const AlertMessage = ({ type, message }) => {
  const alertStyles = {
    error: {
      bg: "bg-red-900/50",
      border: "border-red-700",
      icon: <AlertTriangle className="text-red-400 mr-2 h-5 w-5 flex-shrink-0" />,
      text: "text-white",
    },
    warning: {
      bg: "bg-yellow-900/50",
      border: "border-yellow-700",
      icon: <AlertTriangle className="text-yellow-400 mr-2 h-5 w-5 flex-shrink-0" />,
      text: "text-white",
    },
    success: {
      bg: "bg-green-900/50",
      border: "border-green-700",
      icon: <CheckCircle className="text-green-400 mr-2 h-5 w-5 flex-shrink-0" />,
      text: "text-white",
    },
    info: {
      bg: "bg-blue-900/50",
      border: "border-blue-700",
      icon: <Info className="text-blue-400 mr-2 h-5 w-5 flex-shrink-0" />,
      text: "text-white",
    },
  }

  const style = alertStyles[type] || alertStyles.info

  return (
    <div className={`${style.bg} p-4 rounded-lg border ${style.border} flex items-start mb-4`}>
      {style.icon}
      <div className={style.text}>{message}</div>
    </div>
  )
}

export default AlertMessage
