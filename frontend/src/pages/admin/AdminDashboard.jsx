import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';
import InfoModal from '../../components/InfoModal';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCaDetails, setShowCaDetails] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        addToast("Impossible de charger les statistiques.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Chargement...</p></div>;
  }

  const cards = [
    { label: 'Utilisateurs', value: stats?.utilisateurs, icon: '👥', color: 'bg-blue-500', to: '/admin/utilisateurs' },
    { label: 'Pièces', value: stats?.pieces, icon: '🔧', color: 'bg-green-500', to: '/admin/pieces' },
    { label: 'Commandes', value: stats?.commandes, icon: '📦', color: 'bg-purple-500', to: '/admin/commandes' },
    { label: 'Avis', value: stats?.avis, icon: '⭐', color: 'bg-yellow-500', to: '/admin/avis' },
  ];

  // Couleurs par statut (pour la modale)
  const statutColors = {
    'Livrée': 'bg-green-500',
    'Expédiée': 'bg-blue-500',
    'En attente': 'bg-yellow-500',
    'Annulée': 'bg-red-500',
  };

  // Calcul du CA max pour les barres de progression
  const caParStatut = stats?.ca_par_statut || {};
  const maxCa = Math.max(...Object.values(caParStatut).map((s) => s.total), 1);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Tableau de bord Admin</h1>
        <p className="text-gray-600 mb-10">Gestion complète de la plateforme Car Palace</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card) => (
            <Link key={card.label} to={card.to}>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4`}>
                  {card.icon}
                </div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chiffre d'affaires (cliquable) */}
        <div
          onClick={() => setShowCaDetails(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl shadow-md text-white cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Chiffre d'affaires total</p>
              <p className="text-5xl font-bold">{stats?.chiffre_affaires} €</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Cliquer pour voir le détail</p>
              <p className="text-3xl">📊</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Détails du CA */}
      <InfoModal
        isOpen={showCaDetails}
        title="Détails du chiffre d'affaires"
        onClose={() => setShowCaDetails(false)}
      >
        <p className="text-gray-600 mb-6">
          Répartition du chiffre d'affaires par statut de commande :
        </p>

        {Object.keys(caParStatut).length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucune commande pour le moment.</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(caParStatut).map(([statut, data]) => (
              <div key={statut}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${statutColors[statut] || 'bg-gray-500'}`}></span>
                    <span className="font-semibold text-gray-800">{statut}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {data.nombre} commande{data.nombre > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">{data.total.toFixed(2)} €</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${statutColors[statut] || 'bg-gray-500'} h-3 rounded-full transition-all`}
                    style={{ width: `${(data.total / maxCa) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <span className="text-gray-700 font-semibold">Total</span>
          <span className="text-2xl font-bold text-blue-600">{stats?.chiffre_affaires} €</span>
        </div>
      </InfoModal>
    </div>
  );
}

export default AdminDashboard;