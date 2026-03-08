import { ORDER_STATUSES } from "../../context/DataContext.jsx";

const PAYMENT_LABELS = { mtn: "MTN MoMo", moov: "Moov Money", cash: "Cash" };

export default function CommandesFilters({ filters, onChange, total, filtered }) {
    const update = (k, v) => onChange({ ...filters, [k]: v });

    return (
        <div className="admin-card p-4 flex flex-col sm:flex-row flex-wrap items-center gap-3">

            {/* Recherche */}
            <div className="relative flex-1 min-w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
                <input
                    type="text"
                    placeholder="N° commande, nom client…"
                    value={filters.search}
                    onChange={(e) => update("search", e.target.value)}
                    className="admin-input pl-9"
                />
            </div>

            {/* Statut */}
            <select
                value={filters.status}
                onChange={(e) => update("status", e.target.value)}
                className="admin-input w-auto cursor-pointer"
            >
                <option value="">Tous les statuts</option>
                {Object.entries(ORDER_STATUSES).map(([key, s]) => (
                    <option key={key} value={key}>{s.icon} {s.label}</option>
                ))}
            </select>

            {/* Paiement */}
            <select
                value={filters.payment}
                onChange={(e) => update("payment", e.target.value)}
                className="admin-input w-auto cursor-pointer"
            >
                <option value="">Tous paiements</option>
                {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>

            {/* Tri */}
            <select
                value={filters.sort}
                onChange={(e) => update("sort", e.target.value)}
                className="admin-input w-auto cursor-pointer"
            >
                <option value="date_desc">Plus récentes</option>
                <option value="date_asc">Plus anciennes</option>
                <option value="montant_desc">Montant ↓</option>
                <option value="montant_asc">Montant ↑</option>
            </select>

            {/* Compteur résultats */}
            <span className="text-xs text-neutral-6 whitespace-nowrap shrink-0">
                {filtered} / {total} commande{total > 1 ? "s" : ""}
            </span>

            {/* Reset */}
            {(filters.search || filters.status || filters.payment) && (
                <button
                    onClick={() => onChange({ search: "", status: "", payment: "", sort: "date_desc" })}
                    className="btn-secondary text-xs py-2 px-3 whitespace-nowrap"
                >
                    ✕ Réinitialiser
                </button>
            )}
        </div>
    );
}