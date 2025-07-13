"use client"

import { createContext, useContext } from "react"

// Crear el contexto
const SidebarContext = createContext()

// Hook personalizado para usar el contexto
export const useSidebar = () => useContext(SidebarContext)

// Exportar el contexto para que pueda ser usado por SidebarProvider
export { SidebarContext }