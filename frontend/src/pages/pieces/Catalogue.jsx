import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import pieceService from '../../services/pieceService';
import referenceService from '../../services/referenceService';

function Catalogue() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('titre') || '';

  const [allPieces, setAllPieces] = useState([]);
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    titre: urlSearch,
    marque: '',
    categorie: '',
    etat: '',
    prixMin: '',
    prixMax: '',
  });

  // Synchroniser le filtre titre quand l'URL change (recherche depuis le Header)
  useEffect(() => {
    setFilters((prev) => ({ ...prev, titre: urlSearch }));
  }, [urlSearch]);

  // Chargement initial : pièces + marques + catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [piecesData, marquesData, categoriesData] = await Promise.all([
          pieceService.getAllPieces(),
          referenceService.getAllMarques(),
          referenceService.getAllCategories(),
        ]);
        setAllPieces(Array.isArray(piecesData) ? piecesData : []);
        setMarques(Array.isArray(marquesData) ? marquesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Erreur chargement :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrage LOCAL (aucun appel API, ultra rapide)
  const filteredPieces = useMemo(() => {
    return allPieces.filter((piece) => {
      // Filtre titre (recherche partielle, insensible à la casse)
      if (filters.titre) {
        const searchLower = filters.titre.toLowerCase();
        if (!piece.titre.toLowerCase().includes(searchLower)) return false;
      }

      // Filtre marque (IRI)
      if (filters.marque && piece.marque !== filters.marque) return false;

      // Filtre catégorie (IRI)
      if (filters.categorie && piece.categorie !== filters.categorie) return false;

      // Filtre état
      if (filters.etat && piece.etat !== filters.etat) return false;

      // Filtre prix min
      if (filters.prixMin) {
        if (parseFloat(piece.prix) < parseFloat(filters.prixMin)) return false;
      }

      // Filtre prix max
      if (filters.prixMax) {
        if (parseFloat(piece.prix) > parseFloat(filters.prixMax)) return false;
      }

      return true;
    });
  }, [allPieces, filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      titre: '',
      marque: '',
      categorie: '',
      etat: '',
      prixMin: '',
      prixMax: '',
    });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== '').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Chargement des pièces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de recherche et filtres */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-4">
            <input
              type="text"
              name="titre"
              value={filters.titre}
              onChange={handleChange}
              placeholder="🔍 Rechercher une pièce (ex: plaquette, phare...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <select
              name="marque"
              value={filters.marque}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Toutes les marques</option>
              {marques.map((m) => (
                <option key={m.id} value={`/api/marques/${m.id}`}>{m.nom}</option>
              ))}
            </select>

            <select
              name="categorie"
              value={filters.categorie}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={`/api/categories/${c.id}`}>{c.nom}</option>
              ))}
            </select>

            <select
              name="etat"
              value={filters.etat}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Tous les états</option>
              <option value="Neuf">Neuf</option>
              <option value="Très bon état">Très bon état</option>
              <option value="Bon état">Bon état</option>
              <option value="Usure normale">Usure normale</option>
            </select>

            <input
              type="number"
              name="prixMin"
              value={filters.prixMin}
              onChange={handleChange}
              placeholder="Prix min (€)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            <input
              type="number"
              name="prixMax"
              value={filters.prixMax}
              onChange={handleChange}
              placeholder="Prix max (€)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>
              <strong>{filteredPieces.length}</strong> pièce{filteredPieces.length > 1 ? 's' : ''} trouvée{filteredPieces.length > 1 ? 's' : ''}
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:underline font-semibold"
              >
                ✕ Réinitialiser les filtres ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grille des pièces */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {filteredPieces.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 mb-4">🔍 Aucune pièce ne correspond à ta recherche</p>
              <button
                onClick={resetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
              >
                Voir toutes les pièces
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPieces.map((piece) => (
                <Link to={`/pieces/${piece.id}`} key={piece.id} className="block">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <img
                      src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop"
                      alt={piece.titre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{piece.titre}</h2>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{piece.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">{piece.prix} €</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{piece.statut}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Catalogue;