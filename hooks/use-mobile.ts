// Custom React hook for mobile device detection
// Provides responsive behavior based on screen width

import * as React from "react"

// Breakpoint for mobile devices (768px is standard tablet breakpoint)
const MOBILE_BREAKPOINT = 768

// Custom hook that returns true if the current viewport is mobile-sized
export function useIsMobile() {
  // State to track mobile status, undefined initially to avoid hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Handler to update mobile state when viewport changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Add event listener for media query changes
    mql.addEventListener("change", onChange)

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Cleanup event listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return boolean (converts undefined to false during SSR)
  return !!isMobile
}
