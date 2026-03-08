import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AdminLayout({ children, activePage, requiredRole }) {
    const { isAuthenticated, admin } = useAdminAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Garde d'authentification
    if (!isAuthenticated) {
        window.location.href = "/";
        return null;
    }

    // Garde de rôle (optionnel par page)
    if (requiredRole && admin?.role !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
                <div className="text-center p-10">
                    <span className="text-[56px] block mb-4">🚫</span>
                    <h2 className="font-extrabold text-[20px] mb-2" style={{ color: "#0F172A" }}>Accès refusé</h2>
                    <p className="text-[14px] mb-6" style={{ color: "#64748B" }}>
                        Vous n'avez pas les droits nécessaires pour accéder à cette page.
                    </p>
                    <a href="/dashboard" className="btn-primary no-underline">← Retour au dashboard</a>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.2s ease" }}
        >
            <Sidebar
                activePage={activePage}
                collapsed={collapsed}
                onToggle={() => setCollapsed((v) => !v)}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar activePage={activePage} />

                <main
                    className="flex-1 overflow-y-auto"
                    style={{ background: "#F8FAFC" }}
                >
                    <div className="p-6 animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}