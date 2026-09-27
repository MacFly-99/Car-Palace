import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import pieceService from '../../services/pieceService';

function PieceDetail() {
  const { id } = useParams();
  const [piece, setPiece] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPiece = async () => {
      try {
        const data = await pieceService.getPieceById(id);
        setPiece(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement de la pièce :", err);
        setError("Impossible de charger cette pièce.");
        setLoading(false);
      }
    };
    fetchPiece();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (!piece) return <div className="min-h-screen flex items-center justify-center"><p>Pièce introuvable.</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Retour au catalogue
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=400&fit=crop" 
            alt={piece.titre} 
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{piece.titre}</h1>
            <p className="text-gray-600 mb-6">{piece.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm text-gray-500">Prix</span>
                <p className="text-2xl font-bold text-blue-600">{piece.prix} €</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">État</span>
                <p className="text-lg font-semibold">{piece.etat}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Année</span>
                <p className="text-lg font-semibold">{piece.annee}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Statut</span>
                <p className="text-lg font-semibold text-green-600">{piece.statut}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PieceDetail;