import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import adminService from '../../services/adminService';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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

        {/* Chiffre d'affaires */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl shadow-md text-white">
          <p className="text-sm opacity-80">Chiffre d'affaires total</p>
          <p className="text-5xl font-bold">{stats?.chiffre_affaires} €</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;