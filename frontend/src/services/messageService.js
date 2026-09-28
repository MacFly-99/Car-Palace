import api from './api';

export const messageService = {
  send: async (destinataireId, pieceId, contenu) => {
    const response = await api.post('/messages/send', { destinataireId, pieceId, contenu });
    return response.data;
  },

  getRecus: async () => {
    const response = await api.get('/messages/recus');
    return response.data;
  },

  getEnvoyes: async () => {
    const response = await api.get('/messages/envoyes');
    return response.data;
  },

  getConversation: async (userId) => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/messages/${id}/lu`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data.count;
  },
};

export default messageService;