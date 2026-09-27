import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          🚗 Car Palace
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-white font-semibold hover:text-gray-200 transition-colors"
          >
            Catalogue
          </Link>

          {user ? (
            <>
              <Link
                to="/mes-pieces"
                className="text-white font-semibold hover:text-gray-200 transition-colors"
              >
                Mes pièces
              </Link>
              <Link
                to="/vendre"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                + Vendre
              </Link>
              <div className="flex items-center gap-3 border-l border-blue-400 pl-4 ml-2">
                <span className="text-white text-sm">
                  👤 {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white font-semibold hover:text-gray-200 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
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