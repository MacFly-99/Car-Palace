import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import pieceService from '../../services/pieceService';
import referenceService from '../../services/referenceService';

function VendrePiece() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    etat: 'Bon état',
    annee: '',
    marque: '',
    modele: '',
    categorie: '',
  });

  // Pour optimiser les performances, j'ai fait le choix de charger tous les modèles 
  // une seule fois au démarrage, puis de les filtrer côté React plutôt que de faire 
  // un appel API à chaque changement de marque. Cela réduit le nombre de requêtes HTTP.
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allModeles, setAllModeles] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sécurité frontend : redirection si non connecté
  useEffect(() => {
    if (!user) {
      addToast('Tu dois être connecté pour vendre une pièce.', 'error');
      navigate('/login');
    }
  }, [user, navigate, addToast]);

  // Chargement initial : marques, catégories et TOUS les modèles
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [marquesData, categoriesData, modelesData] = await Promise.all([
          referenceService.getAllMarques(),
          referenceService.getAllCategories(),
          referenceService.getAllModeles(),
        ]);
        setMarques(marquesData);
        setCategories(categoriesData);
        setAllModeles(modelesData);
      } catch (err) {
        console.error("Erreur de chargement des référentiels :", err);
      }
    };
    fetchData();
  }, [user]);

  // Filtrage LOCAL des modèles quand la marque change (pas d'appel API)
  useEffect(() => {
    if (!formData.marque) {
      setModeles([]);
      return;
    }
    const marqueId = formData.marque.split('/').pop();
    const modelesFiltres = allModeles.filter(
      (m) => m.marque && m.marque.endsWith(`/${marqueId}`)
    );
    setModeles(modelesFiltres);
  }, [formData.marque, allModeles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Si on change la marque, on reset le modèle
      ...(name === 'marque' ? { modele: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pieceService.createPieceSecure(formData);
      addToast('Pièce mise en vente avec succès !', 'success');
      navigate('/mes-pieces');
    } catch (err) {
      console.error("Erreur complète :", err);
      console.error("Réponse Symfony :", err.response?.data);
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Erreur lors de la création de l'annonce.";
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Vendre une pièce
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Titre *</label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Plaquettes de frein avant"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décris l'état et les détails de la pièce..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Prix (€) *</label>
              <input
                type="number"
                step="0.01"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Année</label>
              <input
                type="number"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">État</label>
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Neuf">Neuf</option>
              <option value="Très bon état">Très bon état</option>
              <option value="Bon état">Bon état</option>
              <option value="Usure normale">Usure normale</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Marque *</label>
              <select
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choisir --</option>
                {Array.isArray(marques) && marques.map((m) => (
                  <option key={m.id} value={`/api/marques/${m.id}`}>
                    {m.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Modèle (optionnel)</label>
              <select
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                disabled={!formData.marque}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <option value="">-- Choisir --</option>
                {Array.isArray(modeles) && modeles.map((m) => (
                  <option key={m.id} value={`/api/modeles/${m.id}`}>
                    {m.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Catégorie *</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir --</option>
              {Array.isArray(categories) && categories.map((c) => (
                <option key={c.id} value={`/api/categories/${c.id}`}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Publication...' : 'Publier mon annonce'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VendrePiece;