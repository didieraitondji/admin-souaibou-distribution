import { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const PAGE_TITLES = {
    dashboard: { label: "Dashboard", icon: "📊" },
    commandes: { label: "Commandes", icon: "📦" },
    catalogue: { label: "Catalogue", icon: "🛒" },
    clients: { label: "Clients", icon: "👥" },
    livraisons: { label: "Livraisons", icon: "🚚" },
    finances: { label: "Finances", icon: "💰" },
    parametres: { label: "Paramètres", icon: "⚙️" },
};

const NOTIFS_INIT = [
    { id: 1, type: "order", text: "Nouvelle commande SD-X9K2L1", time: "Il y a 3 min", read: false },
    { id: 2, type: "stock", text: "Stock faible : Coca-Cola 33cl", time: "Il y a 15 min", read: false },
    { id: 3, type: "order", text: "Commande SD-A1B2C3 livrée ✓", time: "Il y a 1h", read: true },
    { id: 4, type: "client", text: "Nouveau client inscrit : F. Diop", time: "Il y a 2h", read: true },
];

export default function Topbar({ activePage }) {
    const { admin } = useAdminAuth();
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifs, setNotifs] = useState(NOTIFS_INIT);

    const pageInfo = PAGE_TITLES[activePage] ?? { label: "Administration", icon: "🏠" };
    const unread = notifs.filter((n) => !n.read).length;
    const now = new Date();
    const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

    const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

    return (
        <header
            className="flex items-center gap-4 px-6 sticky top-0 z-20 shrink-0 bg-neutral-0 border-b border-neutral-4"
            style={{ height: "60px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
        >
            {/* Titre page */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-lg">{pageInfo.icon}</span>
                <div>
                    <h1 className="font-bold text-sm leading-none text-neutral-9">{pageInfo.label}</h1>
                    <p className="text-xs mt-0.5 text-neutral-6">
                        {greeting},{" "}
                        <span className="font-semibold text-neutral-7">{admin?.nom?.split(" ")[0]}</span>
                    </p>
                </div>
            </div>

            {/* Recherche */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl flex-1 max-w-xs bg-neutral-2 border border-neutral-4">
                <span className="text-sm">🔍</span>
                <input
                    type="text"
                    placeholder="Rechercher commande, client…"
                    className="bg-transparent border-0 outline-none text-xs w-full text-neutral-9"
                />
                <kbd className="text-xs px-1.5 py-0.5 rounded font-mono bg-neutral-4 text-neutral-6">⌘K</kbd>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifs((v) => !v)}
                        className="relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 border border-neutral-4"
                        style={{ background: showNotifs ? "var(--color-primary-5)" : "var(--color-neutral-2)" }}
                    >
                        <span className="text-base">🔔</span>
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-black text-white bg-danger-1"
                                style={{ fontSize: "9px" }}>
                                {unread}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {showNotifs && (
                        <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-50 animate-fadeIn bg-neutral-0 border border-neutral-4"
                            style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
                            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-4">
                                <span className="font-bold text-xs text-neutral-9">
                                    Notifications{" "}
                                    {unread > 0 && (
                                        <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: "var(--color-danger-2)", color: "var(--color-danger-1)" }}>
                                            {unread}
                                        </span>
                                    )}
                                </span>
                                {unread > 0 && (
                                    <button onClick={markAllRead}
                                        className="text-xs font-semibold border-0 bg-transparent cursor-pointer text-primary-7">
                                        Tout marquer lu
                                    </button>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {notifs.map((n) => (
                                    <div key={n.id}
                                        className="flex items-start gap-3 px-4 py-3 border-b border-neutral-3 last:border-0 transition-colors hover:bg-neutral-2 cursor-pointer"
                                        style={{ background: n.read ? "transparent" : "var(--color-primary-5)" }}>
                                        <span className="text-lg shrink-0 mt-0.5">
                                            {n.type === "order" ? "📦" : n.type === "stock" ? "⚠️" : "👤"}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium leading-snug text-neutral-9">{n.text}</p>
                                            <p className="text-xs mt-0.5 text-neutral-6">{n.time}</p>
                                        </div>
                                        {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-primary-1" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Badge rôle */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: "var(--color-primary-5)", border: "1px solid var(--color-primary-4)" }}>
                    <span className="w-2 h-2 rounded-full bg-primary-1" />
                    <span className="text-xs font-bold capitalize text-primary-7">{admin?.role}</span>
                </div>
            </div>
        </header>
    );
}