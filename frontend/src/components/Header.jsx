import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
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
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          🚗 Car Palace
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="text-white font-semibold hover:text-gray-200 transition-colors">
            Catalogue
          </Link>

          {/* Bouton loupe + dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-gray-200 transition-colors text-xl p-2 rounded-lg hover:bg-blue-700"
              title="Rechercher une pièce"
            >
              🔍
            </button>

            {isSearchOpen && (
              <>
                {/* Overlay invisible pour fermer au clic extérieur */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsSearchOpen(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-lg shadow-2xl p-4 z-40">
                  <form onSubmit={handleSearch}>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Rechercher une pièce
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ex: plaquette, phare, frein..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        OK
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Appuie sur Entrée pour lancer la recherche
                    </p>
                  </form>
                </div>
              </>
            )}
          </div>

          {user ? (
            <>
              <Link to="/mes-pieces" className="text-white font-semibold hover:text-gray-200 transition-colors">
                Mes pièces
              </Link>
              <Link to="/vendre" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                + Vendre
              </Link>

              {isAdmin && (
                <Link to="/admin" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  🛡️ Admin
                </Link>
              )}

              <div className="flex items-center gap-3 border-l border-blue-400 pl-4 ml-2">
                <span className="text-white text-sm">👤 {user.email}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white font-semibold hover:text-gray-200 transition-colors">
                Connexion
              </Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;