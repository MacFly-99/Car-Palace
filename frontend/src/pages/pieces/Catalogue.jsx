import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pieceService from '../../services/pieceService';

function Catalogue() {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPieces = async () => {
      try {
        const data = await pieceService.getAllPieces();
        setPieces(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des pièces :", err);
        setError("Impossible de charger les pièces. Vérifie que ton serveur Symfony est bien démarré.");
        setLoading(false);
      }
    };
    fetchPieces();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Chargement des pièces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">
        Car Palace - Catalogue
      </h1>

      {Array.isArray(pieces) && pieces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {pieces.map((piece) => (
            <Link to={`/pieces/${piece.id}`} key={piece.id} className="block">
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                <img
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop"
                  alt={piece.titre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{piece.titre}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{piece.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{piece.prix} €</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {piece.statut}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">Aucune pièce trouvée pour le moment.</p>
      )}
    </div>
  );
}

export default Catalogue;