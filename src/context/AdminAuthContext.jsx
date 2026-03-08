import { createContext, useContext, useState, useCallback } from "react";

const AdminAuthContext = createContext(null);

const STORAGE_KEY = "sd_admin_session";

// Comptes admin mock — en production, remplacer par une vraie API
const ADMIN_ACCOUNTS = [
    {
        id: "ADMIN-001",
        nom: "Souaïbou Adéyèmi",
        email: "admin@souaibou-distribution.bj",
        password: "admin123",
        role: "superadmin",
        avatar: "SA",
    },
    {
        id: "OPE-001",
        nom: "Kofi Mensah",
        email: "kofi@souaibou-distribution.bj",
        password: "ope123",
        role: "operateur",
        avatar: "KM",
    },
];

function loadSession() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch { return null; }
}

function saveSession(user) {
    try {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_KEY);
    } catch { }
}

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(loadSession);

    const login = useCallback((email, password) => {
        const account = ADMIN_ACCOUNTS.find(
            (a) => a.email === email.trim() && a.password === password
        );
        if (!account) return { success: false, error: "Email ou mot de passe incorrect." };

        const session = {
            id: account.id,
            nom: account.nom,
            email: account.email,
            role: account.role,
            avatar: account.avatar,
            loginAt: new Date().toISOString(),
        };
        setAdmin(session);
        saveSession(session);
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        setAdmin(null);
        saveSession(null);
    }, []);

    const isSuperAdmin = admin?.role === "superadmin";
    const isAuthenticated = !!admin;

    return (
        <AdminAuthContext.Provider value={{ admin, isAuthenticated, isSuperAdmin, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth doit être utilisé dans <AdminAuthProvider>");
    return ctx;
}