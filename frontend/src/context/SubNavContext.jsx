"use client"

import { createContext, useContext, useState, useCallback } from "react"

const SubNavContext = createContext({
  subNav: null,
  setSubNav: () => {},
  clearSubNav: () => {},
})

export function SubNavProvider({ children }) {
  const [subNav, setSubNavState] = useState(null)

  const setSubNav = useCallback((content) => setSubNavState(content), [])
  const clearSubNav = useCallback(() => setSubNavState(null), [])

  return (
    <SubNavContext.Provider value={{ subNav, setSubNav, clearSubNav }}>
      {children}
    </SubNavContext.Provider>
  )
}

export function useSubNav() {
  return useContext(SubNavContext)
}
