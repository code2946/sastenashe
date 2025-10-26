import { useEffect, useState } from "react"

/**
 * Custom hook for scroll-based animations
 * Returns the current scroll progress (0 to 1) based on element position
 */
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      // Calculate scroll progress (0 to 1)
      const maxScroll = documentHeight - windowHeight
      const progress = Math.min(scrollTop / maxScroll, 1)

      setScrollProgress(progress)
    }

    handleScroll() // Initial call
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return scrollProgress
}

/**
 * Custom hook to get scroll position relative to viewport height
 */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    handleScroll() // Initial call
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return scrollY
}

/**
 * Custom hook to check if element is in viewport
 */
export function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(ref)

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [ref, threshold])

  return { ref: setRef, isInView }
}
