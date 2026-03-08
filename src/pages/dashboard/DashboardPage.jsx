import { useData, ORDER_STATUSES, getCommandeTTC } from "../../context/DataContext.jsx";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function formatFCFA(n) {
    return n.toLocaleString("fr-FR") + " FCFA";
}
function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function formatHeure(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
export default function DashboardPage() {
    const { stats, commandes, produits } = useData();
    const { admin } = useAdminAuth();

    const recentCommandes = [...commandes]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    const alertes = [
        ...stats.stockFaibles.map((p) => ({
            id: `stock-${p.id}`,
            type: "warning",
            text: `Stock critique : ${p.nom} — ${p.stock} unité(s) restante(s)`,
            icon: "⚠️",
        })),
        ...commandes
            .filter((c) => c.status === "pending")
            .map((c) => ({
                id: `pending-${c.id}`,
                type: "info",
                text: `Commande ${c.id} en attente de confirmation`,
                icon: "⏳",
            })),
    ];

    return (
        <div className="flex flex-col gap-6">

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon="📦" label="Commandes totales"
                    value={stats.totalCommandes}
                    sub={`${stats.commandesEnCours} en cours`}
                    color="var(--color-secondary-1)"
                />
                <KpiCard
                    icon="💰" label="Chiffre d'affaires"
                    value={formatFCFA(stats.caTotal)}
                    sub={`${formatFCFA(stats.caDelivered)} encaissé`}
                    color="var(--color-primary-7)"
                />
                <KpiCard
                    icon="👥" label="Clients"
                    value={stats.totalClients}
                    sub="clients inscrits"
                    color="var(--color-accent-1)"
                />
                <KpiCard
                    icon="⭐" label="Satisfaction"
                    value={`${stats.tauxSatisfaction}%`}
                    sub={`${stats.commandesLivrees} livraisons réussies`}
                    color="var(--color-primary-1)"
                />
            </div>

            {/* ── Ligne 2 : Graphique CA + Répartition ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 admin-card p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-bold text-sm text-neutral-9">Chiffre d'affaires — 7 derniers jours</h3>
                            <p className="text-xs text-neutral-6 mt-0.5">Commandes livrées uniquement</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-3 text-neutral-7">
                            Cette semaine
                        </span>
                    </div>
                    <CaChart caParJour={stats.caParJour} />
                </div>

                <div className="admin-card p-5 flex flex-col gap-5">
                    <div>
                        <h3 className="font-bold text-sm text-neutral-9">Répartition par type</h3>
                        <p className="text-xs text-neutral-6 mt-0.5">Part du CA par catégorie</p>
                    </div>
                    <RepartitionChart parType={stats.parType} />

                    <div className="border-t border-neutral-4 pt-4">
                        <h4 className="font-bold text-xs text-neutral-7 uppercase tracking-wide mb-3">Paiements</h4>
                        <div className="flex flex-col gap-2">
                            {Object.entries(stats.parPaiement).map(([mode, montant]) => {
                                const total = Object.values(stats.parPaiement).reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? Math.round((montant / total) * 100) : 0;
                                const labels = { mtn: "MTN MoMo", moov: "Moov Money", cash: "Cash" };
                                const colors = { mtn: "#FFCC00", moov: "#0047AB", cash: "#008000" };
                                return (
                                    <div key={mode} className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[mode] }} />
                                        <span className="text-xs text-neutral-7 flex-1">{labels[mode]}</span>
                                        <span className="text-xs font-bold text-neutral-9">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Ligne 3 : Commandes récentes + Alertes ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Commandes récentes */}
                <div className="lg:col-span-2 admin-card">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-4">
                        <h3 className="font-bold text-sm text-neutral-9">Commandes récentes</h3>
                        <a href="/commandes"
                            className="text-xs font-semibold no-underline text-primary-7 hover:text-primary-1 transition-colors">
                            Voir tout →
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCommandes.map((cmd) => {
                                    const status = ORDER_STATUSES[cmd.status];
                                    return (
                                        <tr key={cmd.id}>
                                            <td>
                                                <span className="font-bold text-xs text-neutral-9">{cmd.id}</span>
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-medium text-xs text-neutral-9">{cmd.client.nom}</p>
                                                    <p className="text-xs text-neutral-6">{cmd.client.zone}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-bold text-xs text-neutral-9">
                                                    {formatFCFA(getCommandeTTC(cmd))}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${cmd.status}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="text-xs text-neutral-7">{formatDate(cmd.createdAt)}</p>
                                                    <p className="text-xs text-neutral-6">{formatHeure(cmd.createdAt)}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Colonne droite : Alertes + Statuts */}
                <div className="flex flex-col gap-4">

                    {/* Alertes */}
                    <div className="admin-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-neutral-9">Alertes</h3>
                            {alertes.length > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                    style={{ background: "var(--color-danger-1)" }}>
                                    {alertes.length}
                                </span>
                            )}
                        </div>
                        {alertes.length === 0 ? (
                            <div className="text-center py-4">
                                <span className="text-2xl block mb-2">✅</span>
                                <p className="text-xs text-neutral-6">Aucune alerte active</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {alertes.slice(0, 4).map((a) => (
                                    <div key={a.id}
                                        className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
                                        style={{
                                            background: a.type === "warning" ? "var(--color-warning-2)" : "var(--color-secondary-5)",
                                            border: `1px solid ${a.type === "warning" ? "var(--color-warning-1)" : "var(--color-secondary-3)"}20`,
                                        }}>
                                        <span className="shrink-0 mt-0.5">{a.icon}</span>
                                        <p className="text-neutral-8 leading-snug">{a.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Commandes par statut */}
                    <div className="admin-card p-5">
                        <h3 className="font-bold text-sm text-neutral-9 mb-4">État des commandes</h3>
                        <div className="flex flex-col gap-2.5">
                            {Object.entries(ORDER_STATUSES).map(([key, s]) => {
                                const count = commandes.filter((c) => c.status === key).length;
                                const pct = commandes.length > 0 ? Math.round((count / commandes.length) * 100) : 0;
                                return (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-neutral-7">{s.icon} {s.label}</span>
                                            <span className="text-xs font-bold text-neutral-9">{count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-neutral-3 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, background: s.color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════ */
function KpiCard({ icon, label, value, sub, color }) {
    return (
        <div className="admin-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-7 uppercase tracking-wide">{label}</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="font-extrabold text-xl leading-none text-neutral-9">{value}</p>
                <p className="text-xs text-neutral-6 mt-1">{sub}</p>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   CA CHART (barres CSS)
══════════════════════════════════════════ */
function CaChart({ caParJour }) {
    const entries = Object.entries(caParJour);
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    const dayLabel = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
    };

    return (
        <div className="flex items-end gap-2 h-40">
            {entries.map(([date, val]) => {
                const pct = Math.max((val / maxVal) * 100, val > 0 ? 8 : 2);
                return (
                    <div key={date} className="flex flex-col items-center gap-1.5 flex-1 group">
                        <span className="text-xs font-bold text-neutral-9 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            style={{ fontSize: "10px" }}>
                            {val > 0 ? (val / 1000).toFixed(0) + "k" : ""}
                        </span>
                        <div className="w-full rounded-t-lg transition-all duration-500 cursor-pointer group-hover:opacity-80"
                            style={{
                                height: `${pct}%`,
                                background: val > 0
                                    ? "linear-gradient(180deg,var(--color-primary-1),var(--color-primary-6))"
                                    : "var(--color-neutral-4)",
                                minHeight: "4px",
                            }} />
                        <span className="text-neutral-6 text-center leading-tight" style={{ fontSize: "10px" }}>
                            {dayLabel(date)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ══════════════════════════════════════════
   RÉPARTITION CHART (barres horizontales)
══════════════════════════════════════════ */
function RepartitionChart({ parType }) {
    const total = Object.values(parType).reduce((a, b) => a + b, 0);
    const config = {
        boisson: { label: "Boissons", color: "var(--color-primary-1)", icon: "🍺" },
        location: { label: "Location", color: "var(--color-secondary-1)", icon: "🪑" },
        service: { label: "Services", color: "var(--color-accent-1)", icon: "🎉" },
    };

    return (
        <div className="flex flex-col gap-3">
            {Object.entries(config).map(([key, cfg]) => {
                const val = parType[key] || 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return (
                    <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-neutral-7">{cfg.icon} {cfg.label}</span>
                            <span className="text-xs font-bold text-neutral-9">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-3 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: cfg.color }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}