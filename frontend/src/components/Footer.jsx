import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Colonne 1 : Marque */}
          <div>
            <h3 className="text-2xl font-bold mb-4">🚗 Car Palace</h3>
            <p className="text-gray-400 text-sm">
              La plateforme française de vente de pièces détachées automobiles.
              Des pièces de qualité, au meilleur prix.
            </p>
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Navigation</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Catalogue</Link></li>
              <li><Link to="/vendre" className="hover:text-white transition-colors">Vendre une pièce</Link></li>
              <li><Link to="/mes-pieces" className="hover:text-white transition-colors">Mes annonces</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Catégories */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Catégories</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Freinage</li>
              <li>Moteur</li>
              <li>Eclairage</li>
              <li>Carrosserie</li>
            </ul>
          </div>

          {/* Colonne 4 : Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📧 contact@car-palace.fr</li>
              <li>📞 01 23 45 67 89</li>
              <li>📍 Paris, France</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          © 2026 Car Palace — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}

export default Footer;