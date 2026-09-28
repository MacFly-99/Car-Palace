// Le composant Modal.jsx actuel est prévu pour des confirmations (boutons "Confirmer/Annuler"). 
// On va créer un second composant plus adapté pour afficher du contenu libre.

function InfoModal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay sombre */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Contenu de la modale */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-slide-in max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default InfoModal;