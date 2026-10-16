import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import messageService from '../services/messageService';
import logoIcon from '../assets/logo-icon.png';

function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const count = await messageService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?titre=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <header className="bg-blue-600 shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white rounded-xl p-1 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center">
            <img src={logoIcon} alt="Car Palace" className="w-full h-full object-contain" />
          </div>
          <span className="text-white text-lg sm:text-2xl font-bold">Car Palace</span>
        </Link>

        {/* Nav desktop (caché sur mobile) */}
        <nav className="hidden lg:flex items-center gap-4">
          <Link to="/" className="text-white font-semibold hover:text-gray-200">Catalogue</Link>
          <Link to="/mes-pieces" className="text-white font-semibold hover:text-gray-200">Mes pièces</Link>

          {/* Search (desktop) */}
          <div className="relative">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-white text-xl p-2 hover:bg-blue-700 rounded-lg">
              🔍
            </button>
            {isSearchOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSearchOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-2xl p-4 z-40">
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">OK</button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Panier (desktop) */}
          <Link to="/panier" className="text-white font-semibold hover:text-gray-200 relative">
            🛒 Panier
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/mes-messages" className="text-white font-semibold hover:text-gray-200 relative">
            💬 Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/vendre" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                + Vendre
              </Link>
              {isAdmin && (
                <Link to="/admin" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">
                  🛡️ Admin
                </Link>
              )}
              <div className="flex items-center gap-3 border-l border-blue-400 pl-4 ml-2">
                <span className="text-white text-sm">👤 {user.email}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white font-semibold hover:text-gray-200">Connexion</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                Inscription
              </Link>
            </>
          )}
        </nav>

        {/* Bouton burger (mobile) + indicateurs */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Panier (mobile) */}
          <Link to="/panier" className="text-white text-xl relative p-1">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Bouton burger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-2xl p-2"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-blue-700 border-t border-blue-500">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold py-2">
              🏠 Catalogue
            </Link>

            {user ? (
              <>
                <Link to="/mes-pieces" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold py-2">
                  🔧 Mes pièces
                </Link>
                <Link to="/mes-messages" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold py-2 relative">
                  💬 Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/vendre" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-center">
                  + Vendre
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg text-center">
                    🛡️ Admin
                  </Link>
                )}
                <div className="border-t border-blue-500 pt-3 mt-2">
                  <p className="text-white text-sm mb-2">👤 {user.email}</p>
                  <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold">
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold py-2">
                  Connexion
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-center">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;