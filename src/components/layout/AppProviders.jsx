"use client"

import { ThemeProvider } from "./ThemeContext.jsx"
import { SidebarProvider } from "./sidebarContext.jsx"

/**
 * Componente que envuelve la app con todos los proveedores de contexto.
 */
export function AppProviders({ children }) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </ThemeProvider>
    )
}