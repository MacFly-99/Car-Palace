import api from './api';

export const avisService = {
  // Récupérer tous les avis d'une pièce
  getAvisByPiece: async (pieceId) => {
    const response = await api.get(`/pieces/${pieceId}/avis`);
    return response.data;
  },

  // Créer un nouvel avis
  createAvis: async (avisData) => {
    const response = await api.post('/avis/create', avisData);
    return response.data;
  },
};

export default avisService;