import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import pieceService from '../../services/pieceService';
import avisService from '../../services/avisService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function PieceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [piece, setPiece] = useState(null);
  const [avis, setAvis] = useState([]);
  const [vendeurEmail, setVendeurEmail] = useState(null);
  const [vendeurId, setVendeurId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({ note: 5, titre: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
        const [pieceData, avisData] = await Promise.all([
            pieceService.getPieceById(id),
            avisService.getAvisByPiece(id),
        ]);
        setPiece(pieceData);
        setAvis(Array.isArray(avisData) ? avisData : []);

        // Récupérer les infos du vendeur UNIQUEMENT si connecté
        if (pieceData.vendeur && user) {
            const vId = pieceData.vendeur.split('/').pop();
            setVendeurId(vId);
            try {
                const response = await api.get(`/utilisateurs/${vId}`);
                setVendeurEmail(response.data.email);
            } catch (err) {
                // Silencieux
            }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger cette pièce.");
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitAvis = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await avisService.createAvis({
        pieceId: parseInt(id),
        note: parseInt(formData.note),
        titre: formData.titre,
        description: formData.description,
      });
      addToast('Avis publié avec succès !', 'success');
      setFormData({ note: 5, titre: '', description: '' });
      const newAvis = await avisService.getAvisByPiece(id);
      setAvis(newAvis);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || "Erreur lors de la publication de l'avis.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const noteMoyenne =
    avis.length > 0
      ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
      : null;

  const renderStars = (note) => {
    const full = Math.round(note);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const dejaLaisseAvis = user && avis.some((a) => a.auteurEmail === user.email);
  const isVendeur = user && vendeurEmail === user.email;
  const canContact = user && vendeurId && !isVendeur;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (!piece) return <div className="min-h-screen flex items-center justify-center"><p>Pièce introuvable.</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Retour au catalogue
        </Link>

        {/* Fiche de la pièce */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=400&fit=crop"
            alt={piece.titre}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{piece.titre}</h1>
            <p className="text-gray-600 mb-6">{piece.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm text-gray-500">Prix</span>
                <p className="text-2xl font-bold text-blue-600">{piece.prix} €</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">État</span>
                <p className="text-lg font-semibold">{piece.etat}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Année</span>
                <p className="text-lg font-semibold">{piece.annee}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Statut</span>
                <p className="text-lg font-semibold text-green-600">{piece.statut}</p>
              </div>
            </div>

            {/* Bouton contacter le vendeur */}
            {canContact && (
              <Link
                to={`/messages/${vendeurId}?piece=${piece.id}`}
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                💬 Contacter le vendeur
              </Link>
            )}

            {!user && (
              <p className="text-sm text-gray-500 italic">
                <Link to="/login" className="text-blue-600 underline">Connecte-toi</Link> pour contacter le vendeur.
              </p>
            )}

            {isVendeur && (
              <p className="text-sm text-gray-500 italic">
                C'est ta propre annonce.
              </p>
            )}
          </div>
        </div>

        {/* Section Avis */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Avis ({avis.length})</h2>
            {noteMoyenne && (
              <div className="text-right">
                <div className="text-2xl text-yellow-500">{renderStars(parseFloat(noteMoyenne))}</div>
                <p className="text-sm text-gray-600">{noteMoyenne} / 5 sur {avis.length} avis</p>
              </div>
            )}
          </div>

          {user && !dejaLaisseAvis && (
            <form onSubmit={handleSubmitAvis} className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Laisser un avis</h3>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Note *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, note: n })}
                      className={`text-3xl transition-colors ${
                        n <= formData.note ? 'text-yellow-500' : 'text-gray-300'
                      } hover:text-yellow-400`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Titre *</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  required
                  maxLength="255"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Résume ton avis en quelques mots"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Détaille ton expérience..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Publication...' : 'Publier mon avis'}
              </button>
            </form>
          )}

          {!user && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
              <Link to="/login" className="font-semibold underline">Connecte-toi</Link>{' '}
              pour laisser un avis sur cette pièce.
            </div>
          )}

          {user && dejaLaisseAvis && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
              ✅ Tu as déjà laissé un avis sur cette pièce.
            </div>
          )}

          {avis.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun avis pour le moment. Sois le premier !
            </p>
          ) : (
            <div className="space-y-4">
              {avis.map((a) => (
                <div key={a.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-yellow-500 text-lg">{renderStars(a.note)}</span>
                      <span className="ml-2 font-bold text-gray-800">{a.titre}</span>
                    </div>
                    <span className="text-xs text-gray-500">{a.dateAvis}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{a.description}</p>
                  <p className="text-xs text-gray-400">Par {a.auteurEmail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PieceDetail;