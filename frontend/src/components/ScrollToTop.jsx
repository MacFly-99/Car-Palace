import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Remonte en haut de la page à chaque changement de route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;