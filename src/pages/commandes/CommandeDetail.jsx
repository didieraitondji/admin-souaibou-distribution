import { useState } from "react";
import { useData, ORDER_STATUSES, getCommandeTotal, getCommandeLivraison, getCommandeTTC } from "../../context/DataContext.jsx";

const PAYMENT_LABELS = { mtn: "MTN MoMo 📱", moov: "Moov Money 📱", cash: "Espèces 💵" };

function formatFCFA(n) { return n.toLocaleString("fr-FR") + " FCFA"; }
function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CommandeDetail({ commande, onClose }) {
    const { updateCommandeStatus, assignLivreur, updateCommandeNotes, cancelCommande, livreurs } = useData();
    const [notes, setNotes] = useState(commande.notes ?? "");
    const [notesSaved, setNotesSaved] = useState(false);
    const [showCancel, setShowCancel] = useState(false);

    const status = ORDER_STATUSES[commande.status];
    const nextStatus = status.next;
    const nextLabel = nextStatus ? ORDER_STATUSES[nextStatus]?.label : null;
    const livreur = livreurs.find((l) => l.id === commande.livreurId);
    const livreursDispo = livreurs.filter((l) => l.actif);

    const handleAdvance = () => {
        if (nextStatus) updateCommandeStatus(commande.id, nextStatus);
    };

    const handleCancel = () => {
        cancelCommande(commande.id);
        setShowCancel(false);
        onClose();
    };

    const handleSaveNotes = () => {
        updateCommandeNotes(commande.id, notes);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
    };

    const STATUS_FLOW = ["pending", "confirmed", "preparing", "shipping", "delivered"];
    const currentStep = STATUS_FLOW.indexOf(commande.status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <div
                className="bg-neutral-0 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-4 sticky top-0 bg-neutral-0 z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="font-extrabold text-base text-neutral-9">{commande.id}</h2>
                        <span className={`badge badge-${commande.status}`}>
                            {status.icon} {status.label}
                        </span>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-6 hover:text-neutral-9 hover:bg-neutral-3 transition-all bg-transparent border-0 cursor-pointer text-lg">
                        ✕
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">

                    {/* Timeline progression */}
                    {commande.status !== "cancelled" && (
                        <div className="flex items-center gap-0">
                            {STATUS_FLOW.map((s, i) => {
                                const done = i <= currentStep;
                                const current = i === currentStep;
                                const sInfo = ORDER_STATUSES[s];
                                return (
                                    <div key={s} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                                                style={{
                                                    background: done ? (current ? "var(--color-primary-1)" : "var(--color-accent-5)") : "var(--color-neutral-3)",
                                                    border: current ? "2px solid var(--color-primary-6)" : "2px solid transparent",
                                                    color: done ? (current ? "#0D0D1A" : "var(--color-accent-1)") : "var(--color-neutral-6)",
                                                    boxShadow: current ? "0 0 0 4px var(--color-primary-5)" : "none",
                                                }}>
                                                {done && !current ? "✓" : sInfo.icon}
                                            </div>
                                            <span className="text-neutral-6 text-center leading-tight hidden sm:block"
                                                style={{ fontSize: "9px", color: done ? "var(--color-neutral-8)" : "var(--color-neutral-6)" }}>
                                                {sInfo.label.split(" ")[0]}
                                            </span>
                                        </div>
                                        {i < STATUS_FLOW.length - 1 && (
                                            <div className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-500"
                                                style={{ background: i < currentStep ? "var(--color-accent-1)" : "var(--color-neutral-4)" }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Infos client + commande */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoBlock title="👤 Client" rows={[
                            ["Nom", commande.client.nom],
                            ["Téléphone", commande.client.telephone],
                            ["Zone", commande.client.zone],
                        ]} />
                        <InfoBlock title="📋 Commande" rows={[
                            ["Créée le", formatDateTime(commande.createdAt)],
                            ["Livraison", `${commande.date} à ${commande.heure}`],
                            ["Paiement", PAYMENT_LABELS[commande.paymentMethod]],
                        ]} />
                    </div>

                    {/* Articles */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-wide text-neutral-7 mb-3">🛒 Articles commandés</h4>
                        <div className="admin-card overflow-hidden">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Article</th><th>Qté</th><th>P.U.</th><th>Sous-total</th></tr>
                                </thead>
                                <tbody>
                                    {commande.items.map((item, i) => (
                                        <tr key={i}>
                                            <td><span className="mr-2">{item.emoji}</span>{item.name}</td>
                                            <td className="font-semibold text-neutral-9">×{item.qty}</td>
                                            <td className="text-neutral-7">{formatFCFA(item.price)}</td>
                                            <td className="font-bold text-neutral-9">{formatFCFA(item.price * item.qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-3 border-t border-neutral-4 flex flex-col gap-1.5 items-end bg-neutral-2">
                                <div className="flex justify-between w-48 text-xs text-neutral-7">
                                    <span>Sous-total</span>
                                    <span className="font-semibold">{formatFCFA(getCommandeTotal(commande))}</span>
                                </div>
                                <div className="flex justify-between w-48 text-xs text-neutral-7">
                                    <span>Livraison</span>
                                    <span className="font-semibold">
                                        {getCommandeLivraison(commande) === 0 ? "Offerte 🎁" : formatFCFA(getCommandeLivraison(commande))}
                                    </span>
                                </div>
                                <div className="flex justify-between w-48 text-sm font-extrabold text-neutral-9 pt-1.5 border-t border-neutral-4">
                                    <span>Total TTC</span>
                                    <span>{formatFCFA(getCommandeTTC(commande))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assignation livreur */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-wide text-neutral-7 mb-3">🚚 Livreur assigné</h4>
                        <div className="flex items-center gap-3">
                            {livreur ? (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 border border-neutral-4 bg-neutral-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-secondary-5 text-secondary-1">
                                        {livreur.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-neutral-9">{livreur.nom}</p>
                                        <p className="text-xs text-neutral-6">{livreur.telephone} · {livreur.zone}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-6 italic flex-1">Aucun livreur assigné</p>
                            )}
                            <select
                                value={commande.livreurId ?? ""}
                                onChange={(e) => assignLivreur(commande.id, e.target.value || null)}
                                className="admin-input w-auto cursor-pointer"
                            >
                                <option value="">Choisir un livreur…</option>
                                {livreursDispo.map((l) => (
                                    <option key={l.id} value={l.id}>{l.nom} — {l.zone}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes internes */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-wide text-neutral-7 mb-3">📝 Notes internes</h4>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ajouter une note interne (invisible pour le client)…"
                            rows={3}
                            className="admin-input resize-none"
                        />
                        <div className="flex justify-end mt-2">
                            <button onClick={handleSaveNotes} className="btn-secondary text-xs py-1.5 px-4">
                                {notesSaved ? "✓ Sauvegardé !" : "Sauvegarder"}
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-4">
                        {nextLabel && commande.status !== "cancelled" && (
                            <button onClick={handleAdvance} className="btn-primary">
                                {ORDER_STATUSES[nextStatus].icon} Passer à : {nextLabel}
                            </button>
                        )}
                        {commande.status === "delivered" && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                                style={{ background: "var(--color-success-2)", color: "var(--color-success-1)", border: "1px solid var(--color-accent-4)" }}>
                                ✅ Commande terminée
                            </div>
                        )}
                        {!["delivered", "cancelled"].includes(commande.status) && (
                            !showCancel ? (
                                <button onClick={() => setShowCancel(true)} className="btn-danger ml-auto">
                                    ✕ Annuler la commande
                                </button>
                            ) : (
                                <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold"
                                    style={{ background: "var(--color-danger-2)", borderColor: "var(--color-danger-1)" }}>
                                    <span className="text-danger-1">Confirmer l'annulation ?</span>
                                    <button onClick={handleCancel} className="font-bold px-2 py-1 rounded-lg text-white bg-danger-1 border-0 cursor-pointer text-xs">Oui</button>
                                    <button onClick={() => setShowCancel(false)} className="font-semibold px-2 py-1 rounded-lg border border-neutral-4 bg-neutral-0 cursor-pointer text-xs text-neutral-7">Non</button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ title, rows }) {
    return (
        <div className="rounded-xl border border-neutral-4 overflow-hidden">
            <div className="px-4 py-2.5 bg-neutral-2 border-b border-neutral-4">
                <p className="font-bold text-xs text-neutral-8">{title}</p>
            </div>
            <div className="divide-y divide-neutral-3">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs text-neutral-6">{label}</span>
                        <span className="text-xs font-semibold text-neutral-9 text-right max-w-48">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}