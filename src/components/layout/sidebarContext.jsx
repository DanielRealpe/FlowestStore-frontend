"use client"

import { useState } from "react" 
import { SidebarContext } from "./sidebarUtils"

// Proveedor del contexto
export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  
  return <SidebarContext.Provider value={{ isExpanded, toggleExpand }}>{children}</SidebarContext.Provider>
}

export default SidebarProvider