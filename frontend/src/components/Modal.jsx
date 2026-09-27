// J'ai créé un composant Modal réutilisable pour toutes les actions critiques (suppression, confirmation).
// Cela permet une expérience utilisateur homogène et évite les window.confirm natifs qui cassent le design de l'application.

function Modal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler', type = 'danger' }) {
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    primary: 'bg-blue-600 hover:bg-blue-700',
  };

  const iconColors = {
    danger: 'text-red-600',
    primary: 'text-blue-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay sombre */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Contenu de la modale */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex items-start gap-4 mb-6">
          <div className={`text-4xl ${iconColors[type]}`}>
            {type === 'danger' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-white font-semibold rounded-lg transition-colors ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;