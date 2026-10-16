import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import commandeService from '../../services/commandeService';
import CheckoutModal from '../../components/CheckoutModal';

function Panier() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

const handleValiderCommande = () => {
  if (!user) {
    addToast('Connecte-toi pour valider ta commande.', 'error');
    navigate('/login');
    return;
  }

  if (cart.length === 0) {
    addToast('Ton panier est vide.', 'error');
    return;
  }

  setIsCheckoutOpen(true);
};

const confirmCommande = async (coordonnees) => {
  setLoading(true);

  try {
    const items = cart.map((item) => ({
      pieceId: item.id,
      quantite: item.quantite,
    }));

    await commandeService.createCommande(items);
    addToast('Commande validée avec succès !', 'success');
    clearCart();
    setIsCheckoutOpen(false);
    navigate('/'); // Redirection vers l'accueil
  } catch (err) {
    console.error(err);
    const message = err.response?.data?.error || 'Erreur lors de la validation.';
    addToast(message, 'error');
  } finally {
    setLoading(false);
  }
};

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🛒 Mon panier</h1>
          <p className="text-gray-600 mb-6">Ton panier est vide.</p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block"
          >
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🛒 Mon panier</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0"
            >
              <img
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&h=100&fit=crop"
                alt={item.titre}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.titre}</h3>
                <p className="text-blue-600 font-semibold">{item.prix} €</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantite - 1)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{item.quantite}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantite + 1)}
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
                title="Retirer du panier"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold text-gray-700">Total</span>
            <span className="text-3xl font-bold text-blue-600">
              {cartTotal.toFixed(2)} €
            </span>
          </div>

          <button
            onClick={handleValiderCommande}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Validation...' : '✓ Valider la commande (simulation)'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            ⚠️ Simulation de paiement — aucune transaction réelle ne sera effectuée.
          </p>
        </div>
      </div>
      <CheckoutModal
      isOpen={isCheckoutOpen}
      onClose={() => setIsCheckoutOpen(false)}
      onConfirm={confirmCommande}
      loading={loading}
      user={user}
      />
    </div>
  );
}

export default Panier;