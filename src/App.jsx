/**
 * App.jsx — Admin Souaïbou Distribution
 * Projet séparé : admin-sd/
 * npm install react-router-dom
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

// Pages à venir (étapes suivantes)
// import DashboardPage   from "./pages/dashboard/DashboardPage.jsx";
// import CommandesPage   from "./pages/commandes/CommandesPage.jsx";
// import CataloguePage   from "./pages/catalogue/CataloguePage.jsx";
// import ClientsPage     from "./pages/clients/ClientsPage.jsx";
// import LivraisonsPage  from "./pages/livraisons/LivraisonsPage.jsx";
// import FinancesPage    from "./pages/finances/FinancesPage.jsx";
// import ParametresPage  from "./pages/parametres/ParametresPage.jsx";

// Placeholder pour les pages pas encore développées
function ComingSoon({ page }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="text-[56px] mb-4">🚧</span>
      <h2 className="font-extrabold text-[22px] mb-2" style={{ color: "#0F172A" }}>
        {page} — En développement
      </h2>
      <p className="text-[14px]" style={{ color: "#64748B" }}>
        Cette section sera disponible dans la prochaine étape.
      </p>
    </div>
  );
}

function ProtectedRoute({ children, activePage, requiredRole }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return (
    <AdminLayout activePage={activePage} requiredRole={requiredRole}>
      {children}
    </AdminLayout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAdminAuth();

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      {/* Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute activePage="dashboard">
          <ComingSoon page="Dashboard" />
        </ProtectedRoute>
      } />

      {/* Commandes */}
      <Route path="/commandes" element={
        <ProtectedRoute activePage="commandes">
          <ComingSoon page="Commandes" />
        </ProtectedRoute>
      } />

      {/* Catalogue — superadmin seulement */}
      <Route path="/catalogue" element={
        <ProtectedRoute activePage="catalogue" requiredRole="superadmin">
          <ComingSoon page="Catalogue" />
        </ProtectedRoute>
      } />

      {/* Clients — superadmin seulement */}
      <Route path="/clients" element={
        <ProtectedRoute activePage="clients" requiredRole="superadmin">
          <ComingSoon page="Clients" />
        </ProtectedRoute>
      } />

      {/* Livraisons */}
      <Route path="/livraisons" element={
        <ProtectedRoute activePage="livraisons">
          <ComingSoon page="Livraisons" />
        </ProtectedRoute>
      } />

      {/* Finances — superadmin seulement */}
      <Route path="/finances" element={
        <ProtectedRoute activePage="finances" requiredRole="superadmin">
          <ComingSoon page="Finances" />
        </ProtectedRoute>
      } />

      {/* Paramètres — superadmin seulement */}
      <Route path="/parametres" element={
        <ProtectedRoute activePage="parametres" requiredRole="superadmin">
          <ComingSoon page="Paramètres" />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AdminAuthProvider>
  );
}