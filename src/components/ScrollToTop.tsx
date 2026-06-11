import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Rola a janela para o topo a cada mudança de rota.
 * Respeita âncoras (#hash) — nesse caso não força scroll.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
