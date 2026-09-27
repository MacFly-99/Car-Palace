import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import pieceService from '../../services/pieceService';
import referenceService from '../../services/referenceService';

function ModifierPiece() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    etat: 'Bon état',
    annee: '',
    statut: 'Disponible',
    marque: '',
    modele: '',
    categorie: '',
  });

  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allModeles, setAllModeles] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sécurité : redirection si non connecté
  useEffect(() => {
    if (!user) {
      addToast('Tu dois être connecté.', 'error');
      navigate('/login');
    }
  }, [user, navigate, addToast]);

  // Chargement des données de la pièce + référentiels
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [pieceData, marquesData, categoriesData, modelesData] = await Promise.all([
          pieceService.getPieceForEdit(id),
          referenceService.getAllMarques(),
          referenceService.getAllCategories(),
          referenceService.getAllModeles(),
        ]);

        setFormData({
          titre: pieceData.titre || '',
          description: pieceData.description || '',
          prix: pieceData.prix || '',
          etat: pieceData.etat || 'Bon état',
          annee: pieceData.annee || '',
          statut: pieceData.statut || 'Disponible',
          marque: pieceData.marque || '',
          modele: pieceData.modele || '',
          categorie: pieceData.categorie || '',
        });

        setMarques(marquesData);
        setCategories(categoriesData);
        setAllModeles(modelesData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        addToast("Impossible de charger cette pièce. Tu n'es peut-être pas le propriétaire.", 'error');
        navigate('/mes-pieces');
      }
    };
    fetchData();
  }, [id, user, navigate, addToast]);

  // Filtrage local des modèles quand la marque change
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
      ...(name === 'marque' ? { modele: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await pieceService.updatePieceSecure(id, formData);
      addToast('Pièce modifiée avec succès !', 'success');
      navigate('/mes-pieces');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || 'Erreur lors de la modification.';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Chargement de la pièce...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/mes-pieces" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Retour à mes annonces
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-blue-600 mb-8">
            Modifier l'annonce
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
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
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Statut</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Vendu">Vendu</option>
                  <option value="Réservé">Réservé</option>
                </select>
              </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
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

            <div className="flex gap-4">
              <Link
                to="/mes-pieces"
                className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModifierPiece;