"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
    // 1. Estado para el modo oscuro
    const [darkMode, setDarkMode] = useState(false)

    // 2. Efecto para inicializar el tema desde localStorage o el sistema
    useEffect(() => {
        const isDark =
            localStorage.getItem('theme') === 'dark' ||
            (localStorage.getItem('theme') === null &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)

        setDarkMode(isDark)
    }, [])

    // 3. Efecto para actualizar la clase del <html> y el localStorage
    useEffect(() => {
        const root = document.documentElement // El elemento <html>
        if (darkMode) {
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    // 4. Función para alternar el tema (usamos useCallback para optimizar)
    const toggleTheme = useCallback(() => {
        setDarkMode(prevMode => !prevMode)
    }, [])

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// 5. Hook personalizado para consumir el contexto fácilmente
export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider')
    }
    return context
}