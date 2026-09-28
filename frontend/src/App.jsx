// ==============================================
// IMPORTS REACT
// ==============================================
import { Routes, Route } from 'react-router-dom';

// ==============================================
// IMPORTS COMPOSANTS
// ==============================================
import Header from './components/Header';
import AdminRoute from './components/AdminRoute';

// ==============================================
// IMPORTS PAGES - ESPACE PUBLIC
// ==============================================
import Catalogue from './pages/pieces/Catalogue';
import PieceDetail from './pages/pieces/PieceDetail';

// ==============================================
// IMPORTS PAGES - AUTHENTIFICATION
// ==============================================
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// ==============================================
// IMPORTS PAGES - ESPACE UTILISATEUR
// ==============================================
import VendrePiece from './pages/pieces/VendrePiece';
import MesPieces from './pages/users/MesPieces';
import ModifierPiece from './pages/pieces/ModifierPiece';

// ==============================================
// IMPORTS PAGES - ESPACE ADMIN
// ==============================================
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs';
import AdminPieces from './pages/admin/AdminPieces';
import AdminCommandes from './pages/admin/AdminCommandes';

// ==============================================
// COMPOSANT APP (Routing principal)
// ==============================================
function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* ============================================== */}
        {/* ROUTES PUBLIQUES (accessibles sans connexion) */}
        {/* ============================================== */}
        <Route path="/" element={<Catalogue />} />
        <Route path="/pieces/:id" element={<PieceDetail />} />

        {/* ============================================== */}
        {/* AUTHENTIFICATION */}
        {/* ============================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ============================================== */}
        {/* ESPACE UTILISATEUR (nécessite d'être connecté) */}
        {/* ============================================== */}
        <Route path="/vendre" element={<VendrePiece />} />
        <Route path="/mes-pieces" element={<MesPieces />} />
        <Route path="/pieces/:id/modifier" element={<ModifierPiece />} />

        {/* ============================================== */}
        {/* ESPACE ADMIN (nécessite ROLE_ADMIN) */}
        {/* ============================================== */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUtilisateurs /></AdminRoute>} />
        <Route path="/admin/pieces" element={<AdminRoute><AdminPieces /></AdminRoute>} />
        <Route path="/admin/commandes" element={<AdminRoute><AdminCommandes /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default App;