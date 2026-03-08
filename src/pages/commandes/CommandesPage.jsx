import { useState, useMemo } from "react";
import { useData, ORDER_STATUSES, getCommandeTTC } from "../../context/DataContext.jsx";
import CommandesFilters from "./CommandesFilters.jsx";
import CommandeDetail from "./CommandeDetail.jsx";

const PAYMENT_LABELS = { mtn: "MTN", moov: "Moov", cash: "Cash" };

function formatFCFA(n) { return n.toLocaleString("fr-FR") + " FCFA"; }
function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function formatHeure(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const INIT_FILTERS = { search: "", status: "", payment: "", sort: "date_desc" };

export default function CommandesPage() {
    const { commandes, updateCommandeStatus } = useData();
    const [filters, setFilters] = useState(INIT_FILTERS);
    const [selected, setSelected] = useState(null);   // commande ouverte dans la modale

    /* ── Filtrage + tri ── */
    const filtered = useMemo(() => {
        let list = [...commandes];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter((c) =>
                c.id.toLowerCase().includes(q) ||
                c.client.nom.toLowerCase().includes(q) ||
                c.client.zone.toLowerCase().includes(q)
            );
        }
        if (filters.status) list = list.filter((c) => c.status === filters.status);
        if (filters.payment) list = list.filter((c) => c.paymentMethod === filters.payment);

        list.sort((a, b) => {
            if (filters.sort === "date_desc") return new Date(b.createdAt) - new Date(a.createdAt);
            if (filters.sort === "date_asc") return new Date(a.createdAt) - new Date(b.createdAt);
            if (filters.sort === "montant_desc") return getCommandeTTC(b) - getCommandeTTC(a);
            if (filters.sort === "montant_asc") return getCommandeTTC(a) - getCommandeTTC(b);
            return 0;
        });

        return list;
    }, [commandes, filters]);

    /* ── Onglets statuts rapides ── */
    const statusCounts = useMemo(() => {
        const counts = { all: commandes.length };
        Object.keys(ORDER_STATUSES).forEach((s) => {
            counts[s] = commandes.filter((c) => c.status === s).length;
        });
        return counts;
    }, [commandes]);

    const TAB_STATUTS = [
        { key: "", label: "Toutes", count: statusCounts.all },
        { key: "pending", label: "En attente", count: statusCounts.pending },
        { key: "confirmed", label: "Confirmées", count: statusCounts.confirmed },
        { key: "preparing", label: "Préparation", count: statusCounts.preparing },
        { key: "shipping", label: "En livraison", count: statusCounts.shipping },
        { key: "delivered", label: "Livrées", count: statusCounts.delivered },
        { key: "cancelled", label: "Annulées", count: statusCounts.cancelled },
    ];

    return (
        <>
            <div className="flex flex-col gap-5">

                {/* ── En-tête ── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="font-extrabold text-lg text-neutral-9">Gestion des commandes</h2>
                        <p className="text-xs text-neutral-6 mt-0.5">{commandes.length} commandes au total</p>
                    </div>
                </div>

                {/* ── Onglets statuts ── */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {TAB_STATUTS.map((tab) => {
                        const isActive = filters.status === tab.key;
                        const status = tab.key ? ORDER_STATUSES[tab.key] : null;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilters((f) => ({ ...f, status: tab.key }))}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-0 cursor-pointer transition-all duration-150 whitespace-nowrap text-xs font-semibold shrink-0"
                                style={{
                                    background: isActive ? "var(--color-primary-5)" : "var(--color-neutral-0)",
                                    color: isActive ? "var(--color-primary-7)" : "var(--color-neutral-7)",
                                    border: isActive ? "1px solid var(--color-primary-4)" : "1px solid var(--color-neutral-4)",
                                }}
                            >
                                {status?.icon} {tab.label}
                                {tab.count > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full font-bold"
                                        style={{
                                            fontSize: "10px",
                                            background: isActive ? "var(--color-primary-4)" : "var(--color-neutral-3)",
                                            color: isActive ? "var(--color-primary-7)" : "var(--color-neutral-7)",
                                        }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Filtres ── */}
                <CommandesFilters
                    filters={filters}
                    onChange={setFilters}
                    total={commandes.length}
                    filtered={filtered.length}
                />

                {/* ── Tableau ── */}
                <div className="admin-card overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="text-5xl mb-3">📭</span>
                            <p className="font-bold text-sm text-neutral-9 mb-1">Aucune commande trouvée</p>
                            <p className="text-xs text-neutral-6">Essayez de modifier vos filtres</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>N° Commande</th>
                                        <th>Client</th>
                                        <th>Articles</th>
                                        <th>Montant</th>
                                        <th>Paiement</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((cmd) => {
                                        const status = ORDER_STATUSES[cmd.status];
                                        const next = status.next;
                                        return (
                                            <tr key={cmd.id} className="cursor-pointer" onClick={() => setSelected(cmd)}>
                                                <td>
                                                    <span className="font-extrabold text-xs text-neutral-9">{cmd.id}</span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <p className="font-semibold text-xs text-neutral-9">{cmd.client.nom}</p>
                                                        <p className="text-xs text-neutral-6">{cmd.client.zone}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1 flex-wrap max-w-32">
                                                        {cmd.items.slice(0, 2).map((item, i) => (
                                                            <span key={i} className="text-sm" title={item.name}>{item.emoji}</span>
                                                        ))}
                                                        {cmd.items.length > 2 && (
                                                            <span className="text-xs text-neutral-6">+{cmd.items.length - 2}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="font-bold text-xs text-neutral-9">{formatFCFA(getCommandeTTC(cmd))}</span>
                                                </td>
                                                <td>
                                                    <span className="text-xs font-medium text-neutral-7">
                                                        {PAYMENT_LABELS[cmd.paymentMethod]}
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
                                                <td onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-1.5">
                                                        {/* Bouton avancer statut */}
                                                        {next && cmd.status !== "cancelled" && (
                                                            <button
                                                                onClick={() => updateCommandeStatus(cmd.id, next)}
                                                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                                                style={{ background: "var(--color-primary-5)", color: "var(--color-primary-7)", border: "1px solid var(--color-primary-4)" }}
                                                                title={`Passer à : ${ORDER_STATUSES[next].label}`}
                                                            >
                                                                {ORDER_STATUSES[next].icon} →
                                                            </button>
                                                        )}
                                                        {/* Bouton détail */}
                                                        <button
                                                            onClick={() => setSelected(cmd)}
                                                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer transition-all hover:bg-neutral-3 bg-neutral-2 text-neutral-7"
                                                        >
                                                            Détail
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modale détail ── */}
            {selected && (
                <CommandeDetail
                    commande={commandes.find((c) => c.id === selected.id) ?? selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}