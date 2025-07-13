"use client"
import { canInteractWithItem } from "../utils/permissionUtils"
import StateToggleButton from "./StateToggleButton"

/**
 * Componente genérico para mostrar un elemento (producto, categoría, etc.)
 * con manejo de estados y permisos
 */
const ItemCard = ({
  item,
  onToggleState,
  onEdit,
  onDelete,
  itemType,
  disabledMessage = "Este elemento está inactivo",
}) => {
  const isActive = item.estado === "activo"
  const canInteract = canInteractWithItem(item, item.estado)

  // Aplicar estilos según el estado
  const cardClass = isActive
    ? "border border-gray-200 rounded-lg p-4 bg-white"
    : "border border-gray-200 rounded-lg p-4 bg-gray-100 opacity-70"

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-start">
        <div className={!isActive ? "text-gray-500" : ""}>
          <h3 className="font-bold text-lg">{item.nombre || item.titulo || item.descripcion}</h3>
          {item.descripcion && <p className="text-sm">{item.descripcion}</p>}
        </div>

        <StateToggleButton id={item.id} currentState={item.estado} onToggle={onToggleState} itemType={itemType} />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(item)}
          disabled={!canInteract}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            canInteract ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title={!canInteract ? disabledMessage : "Editar"}
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(item.id)}
          disabled={!canInteract}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            canInteract ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title={!canInteract ? disabledMessage : "Eliminar"}
        >
          Eliminar
        </button>
      </div>

      {!isActive && <div className="mt-2 text-sm text-red-500">{disabledMessage}</div>}
    </div>
  )
}

export default ItemCard
