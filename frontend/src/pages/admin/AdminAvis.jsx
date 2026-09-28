import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';
import Modal from '../../components/Modal';

function AdminAvis() {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avisToDelete, setAvisToDelete] = useState(null);
  const { addToast } = useToast();

  const fetchAvis = async () => {
    try {
      const data = await adminService.getAvis();
      setAvis(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      addToast('Impossible de charger les avis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvis();
  }, []);

  const confirmDelete = async () => {
    if (!avisToDelete) return;
    try {
      await adminService.supprimerAvis(avisToDelete.id);
      setAvis((prev) => prev.filter((a) => a.id !== avisToDelete.id));
      addToast('Avis supprimé.', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Erreur lors de la suppression.', 'error');
    } finally {
      setAvisToDelete(null);
    }
  };

  // Affichage des étoiles
  const renderStars = (note) => {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
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
          Gestion des avis ({avis.length})
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Auteur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pièce</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {avis.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{a.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{a.titre}</td>
                  <td className="px-6 py-4 text-sm text-yellow-500 font-bold">{renderStars(a.note)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.auteurEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.pieceTitre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setAvisToDelete(a)}
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
        isOpen={!!avisToDelete}
        title="Supprimer cet avis ?"
        message={`Es-tu sûr de vouloir supprimer l'avis "${avisToDelete?.titre}" ? Cette action est irréversible.`}
        confirmText="Oui, supprimer"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setAvisToDelete(null)}
      />
    </div>
  );
}

export default AdminAvis;