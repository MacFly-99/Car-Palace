import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUtilisateurs: async () => {
    const response = await api.get('/admin/utilisateurs');
    return response.data;
  },

  changerRole: async (id, role) => {
    const response = await api.put(`/admin/utilisateurs/${id}/role`, { role });
    return response.data;
  },

  supprimerUtilisateur: async (id) => {
    const response = await api.delete(`/admin/utilisateurs/${id}`);
    return response.data;
  },

  getPieces: async () => {
    const response = await api.get('/admin/pieces');
    return response.data;
  },

  supprimerPiece: async (id) => {
    const response = await api.delete(`/admin/pieces/${id}`);
    return response.data;
  },

  getCommandes: async () => {
    const response = await api.get('/admin/commandes');
    return response.data;
  },

  getAvis: async () => {
    const response = await api.get('/admin/avis');
    return response.data;
  },

  supprimerAvis: async (id) => {
    const response = await api.delete(`/admin/avis/${id}`);
    return response.data;
  },
};

export default adminService;