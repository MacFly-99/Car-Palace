import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import messageService from '../../services/messageService';
import api from '../../services/api';

function Messagerie() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const pieceId = searchParams.get('piece');
  const { user } = useAuth();
  const { addToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Charger la conversation + infos de l'autre utilisateur
  const fetchData = async () => {
    try {
      const [conversation, otherUserData] = await Promise.all([
        messageService.getConversation(userId),
        api.get(`/utilisateurs/${userId}`).then(r => r.data).catch(() => null),
      ]);
      setMessages(Array.isArray(conversation) ? conversation : []);
      setOtherUser(otherUserData);
    } catch (err) {
      console.error(err);
      addToast('Impossible de charger la conversation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // Scroll automatique en bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await messageService.send(parseInt(userId), parseInt(pieceId) || 0, newMessage.trim());
      setNewMessage('');
      await fetchData();
    } catch (err) {
      console.error(err);
      addToast('Erreur lors de l\'envoi du message.', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Retour au catalogue
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">
              💬 Conversation avec {otherUser?.email || 'Utilisateur'}
            </h1>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun message. Envoie le premier !
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.isMine
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{msg.contenu}</p>
                    <p className={`text-xs mt-1 ${msg.isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                      {msg.dateEnvoi}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écris ton message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Messagerie;