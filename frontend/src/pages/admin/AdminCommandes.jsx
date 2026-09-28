import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';

function AdminCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const data = await adminService.getCommandes();
        setCommandes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        addToast('Impossible de charger les commandes.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCommandes();
  }, [addToast]);

  // Calcul du CA total à partir des commandes
  const chiffreAffaires = commandes.reduce((total, c) => total + parseFloat(c.total || 0), 0);

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
          Gestion des commandes ({commandes.length})
        </h1>

        {/* Résumé */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-6 mb-8 text-white">
          <p className="text-sm opacity-80 mb-1">Chiffre d'affaires total</p>
          <p className="text-4xl font-bold">{chiffreAffaires.toFixed(2)} €</p>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acheteur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {commandes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucune commande pour le moment.
                  </td>
                </tr>
              ) : (
                commandes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">#{c.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{c.acheteurEmail}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          c.statut === 'Livrée'
                            ? 'bg-green-100 text-green-800'
                            : c.statut === 'Annulée'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {c.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 text-right">
                      {parseFloat(c.total).toFixed(2)} €
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCommandes;