import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const NAV_ITEMS = [
    { id: "dashboard", icon: "📊", label: "Dashboard", href: "/dashboard", roles: ["superadmin", "operateur"] },
    { id: "commandes", icon: "📦", label: "Commandes", href: "/commandes", roles: ["superadmin", "operateur"] },
    { id: "catalogue", icon: "🛒", label: "Catalogue", href: "/catalogue", roles: ["superadmin"] },
    { id: "clients", icon: "👥", label: "Clients", href: "/clients", roles: ["superadmin"] },
    { id: "livraisons", icon: "🚚", label: "Livraisons", href: "/livraisons", roles: ["superadmin", "operateur"] },
    { id: "finances", icon: "💰", label: "Finances", href: "/finances", roles: ["superadmin"] },
    { id: "parametres", icon: "⚙️", label: "Paramètres", href: "/parametres", roles: ["superadmin"] },
];

const NAV_GROUPS = [
    { label: "Principal", ids: ["dashboard", "commandes", "livraisons"] },
    { label: "Gestion", ids: ["catalogue", "clients"] },
    { label: "Administration", ids: ["finances", "parametres"] },
];

export default function Sidebar({ activePage, collapsed, onToggle }) {
    const { admin, logout } = useAdminAuth();

    const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(admin?.role));

    const handleLogout = () => { logout(); window.location.href = "/"; };

    return (
        <aside
            className="flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 overflow-hidden"
            style={{
                width: collapsed ? "64px" : "240px",
                background: "var(--color-sidebar)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            {/* ── Logo ── */}
            <div className="flex items-center gap-3 px-4 py-4 min-h-15"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                    style={{ background: "linear-gradient(135deg,#FFD700,#E6C200)", color: "#0D0D1A" }}>
                    SD
                </div>
                {!collapsed && (
                    <div className="overflow-hidden flex-1">
                        <div className="font-extrabold text-xs text-white whitespace-nowrap">Souaïbou Distrib.</div>
                        <div className="text-xs font-semibold tracking-widest uppercase text-primary-1" style={{ fontSize: "9px" }}>
                            Administration
                        </div>
                    </div>
                )}
                <button onClick={onToggle}
                    className="ml-auto border-0 bg-transparent cursor-pointer text-base shrink-0 hover:opacity-70 transition-opacity text-neutral-7"
                    title={collapsed ? "Développer" : "Réduire"}>
                    {collapsed ? "→" : "←"}
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto py-3 px-2">
                {NAV_GROUPS.map((group) => {
                    const groupItems = group.ids
                        .map((id) => visibleItems.find((item) => item.id === id))
                        .filter(Boolean);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={group.label} className="mb-4">
                            {!collapsed && (
                                <p className="px-3 mb-1.5 font-bold uppercase tracking-widest text-neutral-8"
                                    style={{ fontSize: "10px" }}>
                                    {group.label}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5">
                                {groupItems.map((item) => {
                                    const isActive = activePage === item.id;
                                    return (
                                        <a key={item.id} href={item.href}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline transition-all duration-150 group"
                                            style={{
                                                background: isActive ? "var(--color-primary-5)" : "transparent",
                                            }}
                                            title={collapsed ? item.label : undefined}>
                                            <span className="text-lg shrink-0 transition-transform duration-150 group-hover:scale-110">
                                                {item.icon}
                                            </span>
                                            {!collapsed && (
                                                <span className="text-xs font-semibold whitespace-nowrap"
                                                    style={{ color: isActive ? "var(--color-primary-1)" : "var(--color-neutral-6)" }}>
                                                    {item.label}
                                                </span>
                                            )}
                                            {!collapsed && isActive && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 bg-primary-1" />
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* ── Lien site client ── */}
            {!collapsed && (
                <div className="px-3 py-2 mx-2 mb-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <a href="https://souaibou-distribution.bj" target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 no-underline text-xs font-medium text-neutral-7">
                        <span>🌐</span>
                        <span>Voir le site client</span>
                        <span className="ml-auto">↗</span>
                    </a>
                </div>
            )}

            {/* ── Profil + déconnexion ── */}
            <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-primary-1"
                        style={{
                            background: "linear-gradient(135deg,var(--color-primary-5),var(--color-primary-4))",
                            border: "1px solid var(--color-primary-4)",
                        }}>
                        {admin?.avatar ?? "?"}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{admin?.nom}</p>
                            <p className="capitalize text-primary-1" style={{ fontSize: "10px" }}>{admin?.role}</p>
                        </div>
                    )}
                    <button onClick={handleLogout}
                        className="border-0 bg-transparent cursor-pointer text-base shrink-0 hover:opacity-70 transition-opacity text-neutral-7"
                        title="Se déconnecter">
                        🚪
                    </button>
                </div>
            </div>
        </aside>
    );
}