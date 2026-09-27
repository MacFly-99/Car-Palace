import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import Modal from '../../components/Modal';

function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUtilisateurs();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      addToast('Impossible de charger les utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminService.changerRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      addToast('Rôle mis à jour.', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Erreur lors du changement de rôle.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await adminService.supprimerUtilisateur(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      addToast('Utilisateur supprimé.', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Erreur lors de la suppression.', 'error');
    } finally {
      setUserToDelete(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Chargement...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Retour au dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Gestion des utilisateurs ({users.length})
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ville</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rôle</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{u.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.prenom} {u.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.ville || '-'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUser?.id}
                      className={`text-xs px-2 py-1 rounded font-semibold border-0 ${
                        u.role === 'ROLE_ADMIN'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      } ${u.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <option value="ROLE_USER">ROLE_USER</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setUserToDelete(u)}
                      disabled={u.id === currentUser?.id}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
        isOpen={!!userToDelete}
        title="Supprimer cet utilisateur ?"
        message={`Es-tu sûr de vouloir supprimer "${userToDelete?.email}" ? Toutes ses pièces, avis et commandes seront supprimés. Action irréversible.`}
        confirmText="Oui, supprimer"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}

export default AdminUtilisateurs;