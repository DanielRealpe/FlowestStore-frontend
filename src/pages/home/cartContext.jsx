import { createContext, useContext, useReducer } from "react"

const CartContext = createContext()

const initialState = {
    items: [],
    isOpen: false,
}

function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM":
            // Si ya existe, suma cantidad
            const existing = state.items.find((i) => i.id === action.payload.id)
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.id === action.payload.id
                            ? { ...i, cantidad: i.cantidad + 1 }
                            : i
                    ),
                }
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, cantidad: 1 }],
            }
        case "REMOVE_ITEM":
            return {
                ...state,
                items: state.items.filter((i) => i.id !== action.payload),
            }
        case "INCREMENT":
            return {
                ...state,
                items: state.items.map((i) =>
                    i.id === action.payload ? { ...i, cantidad: i.cantidad + 1 } : i
                ),
            }
        case "DECREMENT":
            return {
                ...state,
                items: state.items
                    .map((i) =>
                        i.id === action.payload
                            ? { ...i, cantidad: Math.max(1, i.cantidad - 1) }
                            : i
                    )
                    .filter((i) => i.cantidad > 0),
            }
        case "TOGGLE_CART":
            return { ...state, isOpen: !state.isOpen }
        case "CLOSE_CART":
            return { ...state, isOpen: false }
        default:
            return state
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState)
    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}