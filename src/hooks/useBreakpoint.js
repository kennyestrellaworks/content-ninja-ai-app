// hooks/useBreakpoint.js
import { useWindowSize } from "./useWindowSize";

export function useBreakpoint() {
  const { width } = useWindowSize();

  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  const currentBreakpoint =
    Object.keys(breakpoints)
      .reverse()
      .find((key) => width >= breakpoints[key]) || "xs";

  return {
    width,
    breakpoint: currentBreakpoint,
    isMobile: width < breakpoints.md, // < 768px
    isTablet: width >= breakpoints.md && width < breakpoints.lg, // 768px - 1023px
    isDesktop: width >= breakpoints.lg, // >= 1024px
  };
}
