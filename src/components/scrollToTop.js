import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // For smooth scrolling
    });
  }, [pathname]); // Run whenever the path changes

  return null;
}

export default ScrollToTop;
