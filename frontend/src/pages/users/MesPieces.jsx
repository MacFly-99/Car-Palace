import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import pieceService from '../../services/pieceService';
import Modal from '../../components/Modal';

function MesPieces() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieceToDelete, setPieceToDelete] = useState(null); // Stocke la pièce à supprimer

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMesPieces = async () => {
      try {
        const data = await pieceService.getMesPieces();
        setPieces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        addToast('Impossible de charger tes pièces.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMesPieces();
  }, [user, navigate, addToast]);

  // Demande de confirmation : on stocke la pièce dans un state
  const requestDelete = (piece) => {
    setPieceToDelete(piece);
  };

  // Annulation
  const cancelDelete = () => {
    setPieceToDelete(null);
  };

  // Confirmation de suppression
  const confirmDelete = async () => {
    if (!pieceToDelete) return;

    try {
      await pieceService.deletePieceSecure(pieceToDelete.id);
      setPieces((prev) => prev.filter((p) => p.id !== pieceToDelete.id));
      addToast('Pièce supprimée avec succès.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erreur lors de la suppression.', 'error');
    } finally {
      setPieceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Chargement de tes annonces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Mes annonces</h1>
          <Link to="/vendre" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center">
            + Nouvelle annonce
          </Link>
        </div>

        {pieces.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <p className="text-gray-600 mb-4">Tu n'as pas encore d'annonce.</p>
            <Link to="/vendre" className="text-blue-600 hover:underline font-semibold">
              Crée ta première annonce →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pieces.map((piece) => (
              <div key={piece.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{piece.titre}</h2>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">{piece.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>💰 {piece.prix} €</span>
                    <span>🏷️ {piece.marque}</span>
                    <span>📁 {piece.categorie}</span>
                    <span className="text-green-600 font-semibold">{piece.statut}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:ml-4">
                  <Link
                    to={`/pieces/${piece.id}`}
                    className="flex-1 sm:flex-none text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Voir
                  </Link>
                  <Link
                    to={`/pieces/${piece.id}/modifier`}
                    className="flex-1 sm:flex-none text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => requestDelete(piece)}
                    className="flex-1 sm:flex-none text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale de confirmation */}
      <Modal
        isOpen={!!pieceToDelete}
        title="Supprimer cette annonce ?"
        message={`Es-tu sûr de vouloir supprimer "${pieceToDelete?.titre}" ? Cette action est irréversible.`}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default MesPieces;