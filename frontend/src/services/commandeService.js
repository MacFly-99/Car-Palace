import api from './api';

export const commandeService = {
  // Créer une commande à partir du panier
  createCommande: async (items) => {
    const response = await api.post('/commandes/create', { items });
    return response.data;
  },

  // Récupérer les commandes de l'utilisateur connecté
  getMesCommandes: async () => {
    const response = await api.get('/mes-commandes');
    return response.data;
  },
};

export default commandeService;