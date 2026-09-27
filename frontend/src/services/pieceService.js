import api from './api';

export const pieceService = {
  /**
   * Récupère la liste de toutes les pièces.
   * On peut passer des filtres en paramètre (ex: { marque: '/api/marques/1', prix: 'ASC' })
   */
    getAllPieces: async (filters = {}) => {
    const response = await api.get('/pieces', { params: filters });
    
    // On vérifie toutes les façons possibles dont l'API peut renvoyer les données
    if (response.data['hydra:member']) {
      return response.data['hydra:member']; // Format JSON-LD classique
    }
    if (response.data.member) {
      return response.data.member; // Format JSON-LD alternatif
    }
    if (Array.isArray(response.data)) {
      return response.data; // Si c'est déjà un tableau direct
    }
    
    // En dernier recours, on renvoie un tableau vide pour éviter le crash
    return [];
  },

  /**
   * Récupère une pièce par son ID.
   */
  getPieceById: async (id) => {
    const response = await api.get(`/pieces/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle pièce. Nécessite d'être connecté (token JWT).
   * @param {Object} pieceData - Les données de la pièce à créer
   */
  createPiece: async (pieceData) => {
    const response = await api.post('/pieces', pieceData);
    return response.data;
  },

  /**
   * Met à jour une pièce existante. Nécessite d'être connecté.
   * @param {number} id - L'ID de la pièce
   * @param {Object} pieceData - Les nouvelles données
   */
  updatePiece: async (id, pieceData) => {
    const response = await api.put(`/pieces/${id}`, pieceData);
    return response.data;
  },

  /**
   * Supprime une pièce. Nécessite d'être connecté.
   * @param {number} id - L'ID de la pièce à supprimer
   */
  deletePiece: async (id) => {
    const response = await api.delete(`/pieces/${id}`);
    return response.data;
  },

  /**
   * Récupère toutes les pièces d'un vendeur spécifique.
   * @param {number} vendeurId - L'ID du vendeur
   */
  getPiecesByVendeur: async (vendeurId) => {
    const response = await api.get(`/pieces`, {
      params: { vendeur: `/api/utilisateurs/${vendeurId}` }
    });
    return response.data['hydra:member'] || response.data;
  },

  /**
   * Récupère toutes les pièces d'une catégorie spécifique.
   * @param {number} categorieId - L'ID de la catégorie
   */
  getPiecesByCategorie: async (categorieId) => {
    const response = await api.get(`/pieces`, {
      params: { categorie: `/api/categories/${categorieId}` }
    });
    return response.data['hydra:member'] || response.data;
  },

  /**
   * Récupère toutes les pièces d'une marque spécifique.
   * @param {number} marqueId - L'ID de la marque
   */
  getPiecesByMarque: async (marqueId) => {
    const response = await api.get(`/pieces`, {
      params: { marque: `/api/marques/${marqueId}` }
    });
    return response.data['hydra:member'] || response.data;
  },

  // Créer une pièce via le contrôleur sécurisé
  createPieceSecure: async (pieceData) => {
    const response = await api.post('/pieces/create', pieceData);
    return response.data;
  },

  // Récupérer les pièces de l'utilisateur connecté
  getMesPieces: async () => {
    const response = await api.get('/mes-pieces');
    return response.data;
  },

  // Récupérer les données brutes d'une pièce pour l'édition
  getPieceForEdit: async (id) => {
    const response = await api.get(`/pieces/${id}/edit-data`);
    return response.data;
  },

  // Mettre à jour une pièce
  updatePieceSecure: async (id, pieceData) => {
    const response = await api.put(`/pieces/${id}/update`, pieceData);
    return response.data;
  },

  // Supprimer une pièce (avec vérification côté serveur)
  deletePieceSecure: async (id) => {
    const response = await api.delete(`/pieces/${id}/delete`);
    return response.data;
  },
};

export default pieceService;