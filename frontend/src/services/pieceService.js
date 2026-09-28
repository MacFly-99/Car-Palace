import api from './api';

export const pieceService = {
  /**
   * Récupère la liste des pièces avec filtres optionnels.
   * @param {Object} filters - { titre, marque, categorie, etat, prixMin, prixMax }
   */
    getAllPieces: async (filters = {}) => {
    const params = {};

    if (filters.titre) params.titre = filters.titre;
    if (filters.marque) params.marque = filters.marque;
    if (filters.categorie) params.categorie = filters.categorie;
    if (filters.etat) params.etat = filters.etat;
    if (filters.prixMin) params['prix[gte]'] = filters.prixMin;
    if (filters.prixMax) params['prix[lte]'] = filters.prixMax;

    const response = await api.get('/pieces', { params });
    const data = response.data;

    // Gérer TOUS les formats possibles (API Platform 2.x et 3.x)
    if (Array.isArray(data)) return data;
    if (data.member && Array.isArray(data.member)) return data.member;
    if (data['hydra:member'] && Array.isArray(data['hydra:member'])) return data['hydra:member'];

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
   * Crée une nouvelle pièce. Nécessite d'être connecté.
   */
  createPiece: async (pieceData) => {
    const response = await api.post('/pieces', pieceData);
    return response.data;
  },

  /**
   * Met à jour une pièce existante.
   */
  updatePiece: async (id, pieceData) => {
    const response = await api.put(`/pieces/${id}`, pieceData);
    return response.data;
  },

  /**
   * Supprime une pièce.
   */
  deletePiece: async (id) => {
    const response = await api.delete(`/pieces/${id}`);
    return response.data;
  },

  /**
   * Récupère les pièces d'un vendeur spécifique.
   */
  getPiecesByVendeur: async (vendeurId) => {
    const response = await api.get(`/pieces`, {
      params: { vendeur: `/api/utilisateurs/${vendeurId}` }
    });
    if (response.data['hydra:member']) return response.data['hydra:member'];
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Récupère les pièces d'une catégorie spécifique.
   */
  getPiecesByCategorie: async (categorieId) => {
    const response = await api.get(`/pieces`, {
      params: { categorie: `/api/categories/${categorieId}` }
    });
    if (response.data['hydra:member']) return response.data['hydra:member'];
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Récupère les pièces d'une marque spécifique.
   */
  getPiecesByMarque: async (marqueId) => {
    const response = await api.get(`/pieces`, {
      params: { marque: `/api/marques/${marqueId}` }
    });
    if (response.data['hydra:member']) return response.data['hydra:member'];
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Créer une pièce via le contrôleur sécurisé.
   */
  createPieceSecure: async (pieceData) => {
    const response = await api.post('/pieces/create', pieceData);
    return response.data;
  },

  /**
   * Récupérer les pièces de l'utilisateur connecté.
   */
  getMesPieces: async () => {
    const response = await api.get('/mes-pieces');
    return response.data;
  },

  /**
   * Supprimer une pièce (avec vérification côté serveur).
   */
  deletePieceSecure: async (id) => {
    const response = await api.delete(`/pieces/${id}/delete`);
    return response.data;
  },

  /**
   * Récupérer les données brutes d'une pièce pour l'édition.
   */
  getPieceForEdit: async (id) => {
    const response = await api.get(`/pieces/${id}/edit-data`);
    return response.data;
  },

  /**
   * Mettre à jour une pièce.
   */
  updatePieceSecure: async (id, pieceData) => {
    const response = await api.put(`/pieces/${id}/update`, pieceData);
    return response.data;
  },
};

export default pieceService;