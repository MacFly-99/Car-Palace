// La page de gestion des pièces permet à l'administrateur de modérer les annonces en supprimant 
// celles qui sont frauduleuses ou inappropriées. La suppression est protégée par une modale de 
// confirmation et détecte automatiquement si l'utilisateur est bien administrateur côté serveur.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';
import Modal from '../../components/Modal';

function AdminPieces() {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieceToDelete, setPieceToDelete] = useState(null);
  const { addToast } = useToast();

  const fetchPieces = async () => {
    try {
      const data = await adminService.getPieces();
      setPieces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      addToast('Impossible de charger les pièces.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPieces();
  }, []);

  const confirmDelete = async () => {
    if (!pieceToDelete) return;
    try {
      await adminService.supprimerPiece(pieceToDelete.id);
      setPieces((prev) => prev.filter((p) => p.id !== pieceToDelete.id));
      addToast('Pièce supprimée.', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Erreur lors de la suppression.', 'error');
    } finally {
      setPieceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Retour au dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Gestion des pièces ({pieces.length})
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marque</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Catégorie</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prix</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendeur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pieces.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{p.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.titre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.marque || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.categorie || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">{p.prix} €</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.vendeurEmail}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-semibold ${
                        p.statut === 'Disponible'
                          ? 'bg-green-100 text-green-800'
                          : p.statut === 'Vendu'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {p.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setPieceToDelete(p)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!pieceToDelete}
        title="Supprimer cette pièce ?"
        message={`Es-tu sûr de vouloir supprimer "${pieceToDelete?.titre}" ? Cette action est irréversible.`}
        confirmText="Oui, supprimer"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPieceToDelete(null)}
      />
    </div>
  );
}

export default AdminPieces;