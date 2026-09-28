import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import messageService from '../../services/messageService';

function MesMessages() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const [recus, envoyes] = await Promise.all([
        messageService.getRecus(),
        messageService.getEnvoyes(),
      ]);

      const allMessages = [...(recus || []), ...(envoyes || [])];

      // Regrouper par "autre utilisateur"
      const conversationsMap = {};
      allMessages.forEach((msg) => {
        const otherUserId = msg.isMine ? msg.destinataireId : msg.expediteurId;
        const otherEmail = msg.isMine ? msg.destinataireEmail : msg.expediteurEmail;

        if (!conversationsMap[otherUserId]) {
          conversationsMap[otherUserId] = {
            otherUserId,
            otherEmail,
            lastMessage: msg,
            unreadCount: 0,
            totalMessages: 0,
          };
        }

        // On garde le message le plus récent
        if (new Date(msg.dateEnvoi) > new Date(conversationsMap[otherUserId].lastMessage.dateEnvoi)) {
          conversationsMap[otherUserId].lastMessage = msg;
        }

        conversationsMap[otherUserId].totalMessages += 1;

        // On compte les non-lus (messages reçus et non lus)
        if (!msg.isMine && !msg.lu) {
          conversationsMap[otherUserId].unreadCount += 1;
        }
      });

      // Trier par date du dernier message (plus récent en haut)
      const sortedConversations = Object.values(conversationsMap).sort(
        (a, b) => new Date(b.lastMessage.dateEnvoi) - new Date(a.lastMessage.dateEnvoi)
      );

      setConversations(sortedConversations);
    } catch (err) {
      console.error(err);
      addToast('Impossible de charger les conversations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">💬 Mes messages</h1>

        {conversations.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <p className="text-gray-600 mb-4">Tu n'as aucune conversation pour l'instant.</p>
            <Link to="/" className="text-blue-600 hover:underline font-semibold">
              Parcourir le catalogue →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.otherUserId}
                to={`/messages/${conv.otherUserId}`}
                className="block"
              >
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-800">
                          {conv.otherEmail || `Utilisateur #${conv.otherUserId}`}
                        </h2>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unreadCount} nouveau{conv.unreadCount > 1 ? 'x' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-1">
                        {conv.lastMessage.isMine ? 'Vous : ' : ''}
                        {conv.lastMessage.contenu}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">{conv.lastMessage.dateEnvoi}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conv.totalMessages} message{conv.totalMessages > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MesMessages;