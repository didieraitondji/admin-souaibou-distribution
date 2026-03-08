import { createContext, useContext, useState, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════
   STATUTS COMMANDES
═══════════════════════════════════════════════ */
export const ORDER_STATUSES = {
    pending: { label: "En attente", icon: "⏳", color: "#D97706", next: "confirmed" },
    confirmed: { label: "Confirmée", icon: "✅", color: "#0047AB", next: "preparing" },
    preparing: { label: "En préparation", icon: "📦", color: "#7C3AED", next: "shipping" },
    shipping: { label: "En livraison", icon: "🚚", color: "#0891B2", next: "delivered" },
    delivered: { label: "Livrée", icon: "🎉", color: "#008000", next: null },
    cancelled: { label: "Annulée", icon: "❌", color: "#DC2626", next: null },
};

/* ═══════════════════════════════════════════════
   LIVREURS MOCK
═══════════════════════════════════════════════ */
const LIVREURS_INIT = [
    { id: "LIV-001", nom: "Kofi Mensah", telephone: "+229 97 00 11 22", zone: "Cotonou Centre", actif: true, avatar: "KM" },
    { id: "LIV-002", nom: "Séraphin Dossa", telephone: "+229 96 33 44 55", zone: "Akpakpa / Est", actif: true, avatar: "SD" },
    { id: "LIV-003", nom: "Raoul Agossou", telephone: "+229 95 77 88 99", zone: "Calavi / Abomey", actif: false, avatar: "RA" },
];

/* ═══════════════════════════════════════════════
   CLIENTS MOCK
═══════════════════════════════════════════════ */
const CLIENTS_INIT = [
    { id: "USR-001", nom: "Adjovi Mireille", telephone: "+229 97 11 22 33", email: "", ville: "Cotonou", commandes: 4, totalDepense: 87500, inscritLe: "2024-11-10", actif: true },
    { id: "USR-002", nom: "Kokou Mensah", telephone: "+229 96 55 44 33", email: "kokou@gmail.com", ville: "Cotonou", commandes: 2, totalDepense: 32500, inscritLe: "2024-12-01", actif: true },
    { id: "USR-003", nom: "Fatoumata Diallo", telephone: "+229 95 22 11 00", email: "fatou@yahoo.fr", ville: "Abomey-Calavi", commandes: 6, totalDepense: 143000, inscritLe: "2024-09-22", actif: true },
    { id: "USR-004", nom: "Rodrigue Gbèdji", telephone: "+229 97 66 77 88", email: "", ville: "Porto-Novo", commandes: 1, totalDepense: 15000, inscritLe: "2025-01-05", actif: true },
    { id: "USR-005", nom: "Aïssatou Traoré", telephone: "+229 96 12 34 56", email: "aissatou@gmail.com", ville: "Cotonou", commandes: 8, totalDepense: 215000, inscritLe: "2024-08-15", actif: true },
    { id: "USR-006", nom: "Théophile Hounnou", telephone: "+229 95 98 76 54", email: "", ville: "Bohicon", commandes: 3, totalDepense: 48000, inscritLe: "2024-10-30", actif: false },
    { id: "USR-007", nom: "Clémentine Zannou", telephone: "+229 97 45 67 89", email: "clem.zannou@hotmail.com", ville: "Cotonou", commandes: 5, totalDepense: 97000, inscritLe: "2024-07-18", actif: true },
    { id: "USR-008", nom: "Marcel Agbodjan", telephone: "+229 96 01 23 45", email: "", ville: "Sèmè-Kpodji", commandes: 2, totalDepense: 28500, inscritLe: "2025-02-14", actif: true },
];

/* ═══════════════════════════════════════════════
   PRODUITS MOCK
═══════════════════════════════════════════════ */
const PRODUITS_INIT = [
    // Boissons
    { id: "BOI-001", type: "boisson", categorie: "Bières", nom: "Castel Beer 65cl × 12", emoji: "🍺", prix: 9600, stock: 48, actif: true, promo: false },
    { id: "BOI-002", type: "boisson", categorie: "Bières", nom: "Heineken 33cl × 24", emoji: "🍺", prix: 16800, stock: 30, actif: true, promo: true },
    { id: "BOI-003", type: "boisson", categorie: "Softs", nom: "Coca-Cola 1.5L × 12", emoji: "🥤", prix: 6000, stock: 60, actif: true, promo: false },
    { id: "BOI-004", type: "boisson", categorie: "Softs", nom: "Fanta Orange 1L × 12", emoji: "🍊", prix: 5400, stock: 45, actif: true, promo: false },
    { id: "BOI-005", type: "boisson", categorie: "Eaux", nom: "Eau minérale 1.5L × 12", emoji: "💧", prix: 3600, stock: 5, actif: true, promo: false }, // stock faible
    { id: "BOI-006", type: "boisson", categorie: "Vins", nom: "Vin Baron de Lestac 75cl", emoji: "🍷", prix: 8500, stock: 24, actif: true, promo: false },
    { id: "BOI-007", type: "boisson", categorie: "Spiritueux", nom: "Whisky Jack Daniel's 70cl", emoji: "🥃", prix: 22000, stock: 12, actif: false, promo: false },

    // Location
    { id: "LOC-001", type: "location", categorie: "Mobilier", nom: "Chaise plastique blanche", emoji: "🪑", prix: 150, stock: 500, actif: true, promo: false },
    { id: "LOC-002", type: "location", categorie: "Mobilier", nom: "Table ronde 180cm", emoji: "⭕", prix: 2000, stock: 80, actif: true, promo: false },
    { id: "LOC-003", type: "location", categorie: "Vaisselle", nom: "Assiette creuse (lot 10)", emoji: "🍽️", prix: 1000, stock: 200, actif: true, promo: false },
    { id: "LOC-004", type: "location", categorie: "Structures", nom: "Tente pagode 5×5m", emoji: "⛺", prix: 35000, stock: 8, actif: true, promo: true },
    { id: "LOC-005", type: "location", categorie: "Sonorisation", nom: "Pack sono 2000W", emoji: "🔊", prix: 50000, stock: 3, actif: true, promo: false },

    // Services
    { id: "SRV-001", type: "service", categorie: "Traiteur", nom: "Pack Traiteur Standard", emoji: "🍽️", prix: 3500, stock: null, actif: true, promo: false },
    { id: "SRV-002", type: "service", categorie: "Décoration", nom: "Pack Déco Classique", emoji: "🌸", prix: 75000, stock: null, actif: true, promo: false },
    { id: "SRV-003", type: "service", categorie: "Animation", nom: "Pack DJ + Sono 4h", emoji: "🎵", prix: 120000, stock: null, actif: true, promo: false },
    { id: "SRV-004", type: "service", categorie: "Sonorisation", nom: "Sonorisation seule 4h", emoji: "🎙️", prix: 60000, stock: null, actif: true, promo: false },
];

/* ═══════════════════════════════════════════════
   COMMANDES MOCK
═══════════════════════════════════════════════ */
const COMMANDES_INIT = [
    {
        id: "SD-A1B2C3",
        status: "shipping",
        clientId: "USR-001",
        client: { nom: "Adjovi Mireille", telephone: "+229 97 11 22 33", zone: "Cotonou – Akpakpa" },
        livreurId: "LIV-001",
        date: "2025-06-15",
        heure: "14:00",
        paymentMethod: "mtn",
        items: [
            { produitId: "BOI-001", name: "Castel Beer × 12", emoji: "🍺", qty: 5, price: 9600 },
            { produitId: "BOI-003", name: "Coca-Cola 1.5L × 12", emoji: "🥤", qty: 2, price: 6000 },
            { produitId: "BOI-005", name: "Eau minérale × 12", emoji: "💧", qty: 3, price: 3600 },
        ],
        notes: "",
        createdAt: "2025-06-15T10:32:00",
    },
    {
        id: "SD-D4E5F6",
        status: "delivered",
        clientId: "USR-002",
        client: { nom: "Kokou Mensah", telephone: "+229 96 55 44 33", zone: "Cotonou – Fidjrossè" },
        livreurId: "LIV-002",
        date: "2025-06-12",
        heure: "11:00",
        paymentMethod: "cash",
        items: [
            { produitId: "LOC-001", name: "Chaise plastique ×50", emoji: "🪑", qty: 50, price: 150 },
            { produitId: "LOC-002", name: "Table ronde ×10", emoji: "⭕", qty: 10, price: 2000 },
            { produitId: "LOC-003", name: "Nappe blanche ×10", emoji: "⬜", qty: 10, price: 500 },
        ],
        notes: "Restitution prévue le 13/06",
        createdAt: "2025-06-11T08:15:00",
    },
    {
        id: "SD-G7H8I9",
        status: "preparing",
        clientId: "USR-003",
        client: { nom: "Fatoumata Diallo", telephone: "+229 95 22 11 00", zone: "Abomey-Calavi" },
        livreurId: null,
        date: "2025-06-16",
        heure: "09:00",
        paymentMethod: "moov",
        items: [
            { produitId: "BOI-002", name: "Heineken 33cl ×48", emoji: "🍺", qty: 2, price: 16800 },
            { produitId: "BOI-003", name: "Jus de Bissap ×20", emoji: "🫐", qty: 1, price: 6000 },
        ],
        notes: "",
        createdAt: "2025-06-15T18:20:00",
    },
    {
        id: "SD-J1K2L3",
        status: "pending",
        clientId: "USR-005",
        client: { nom: "Aïssatou Traoré", telephone: "+229 96 12 34 56", zone: "Cotonou – Centre" },
        livreurId: null,
        date: "2025-06-17",
        heure: "10:00",
        paymentMethod: "mtn",
        items: [
            { produitId: "LOC-004", name: "Tente pagode 5×5m", emoji: "⛺", qty: 2, price: 35000 },
            { produitId: "LOC-005", name: "Pack sono 2000W", emoji: "🔊", qty: 1, price: 50000 },
        ],
        notes: "Mariage le 18/06 — livraison avant 8h",
        createdAt: "2025-06-16T09:00:00",
    },
    {
        id: "SD-M4N5O6",
        status: "confirmed",
        clientId: "USR-007",
        client: { nom: "Clémentine Zannou", telephone: "+229 97 45 67 89", zone: "Cotonou – Cadjèhoun" },
        livreurId: "LIV-001",
        date: "2025-06-17",
        heure: "15:00",
        paymentMethod: "cash",
        items: [
            { produitId: "SRV-002", name: "Pack Déco Classique", emoji: "🌸", qty: 1, price: 75000 },
            { produitId: "BOI-006", name: "Vin Baron de Lestac", emoji: "🍷", qty: 6, price: 8500 },
        ],
        notes: "",
        createdAt: "2025-06-16T14:30:00",
    },
    {
        id: "SD-P7Q8R9",
        status: "cancelled",
        clientId: "USR-004",
        client: { nom: "Rodrigue Gbèdji", telephone: "+229 97 66 77 88", zone: "Porto-Novo" },
        livreurId: null,
        date: "2025-06-14",
        heure: "12:00",
        paymentMethod: "mtn",
        items: [
            { produitId: "BOI-003", name: "Coca-Cola 1.5L ×12", emoji: "🥤", qty: 3, price: 6000 },
        ],
        notes: "Annulée par le client",
        createdAt: "2025-06-13T11:00:00",
    },
    {
        id: "SD-S1T2U3",
        status: "delivered",
        clientId: "USR-005",
        client: { nom: "Aïssatou Traoré", telephone: "+229 96 12 34 56", zone: "Cotonou – Centre" },
        livreurId: "LIV-002",
        date: "2025-06-10",
        heure: "16:00",
        paymentMethod: "moov",
        items: [
            { produitId: "SRV-003", name: "Pack DJ + Sono 4h", emoji: "🎵", qty: 1, price: 120000 },
        ],
        notes: "",
        createdAt: "2025-06-09T10:00:00",
    },
    {
        id: "SD-V4W5X6",
        status: "delivered",
        clientId: "USR-003",
        client: { nom: "Fatoumata Diallo", telephone: "+229 95 22 11 00", zone: "Abomey-Calavi" },
        livreurId: "LIV-003",
        date: "2025-06-08",
        heure: "11:30",
        paymentMethod: "cash",
        items: [
            { produitId: "BOI-001", name: "Castel Beer × 12", emoji: "🍺", qty: 8, price: 9600 },
            { produitId: "BOI-004", name: "Fanta Orange × 12", emoji: "🍊", qty: 4, price: 5400 },
        ],
        notes: "",
        createdAt: "2025-06-07T09:30:00",
    },
];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
export function getCommandeTotal(commande) {
    return commande.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getCommandeLivraison(commande) {
    const total = getCommandeTotal(commande);
    return total >= 10000 ? 0 : 1500;
}

export function getCommandeTTC(commande) {
    return getCommandeTotal(commande) + getCommandeLivraison(commande);
}

/* ═══════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════ */
const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [commandes, setCommandes] = useState(COMMANDES_INIT);
    const [produits, setProduits] = useState(PRODUITS_INIT);
    const [clients, setClients] = useState(CLIENTS_INIT);
    const [livreurs, setLivreurs] = useState(LIVREURS_INIT);

    /* ── Commandes ── */
    const updateCommandeStatus = useCallback((id, newStatus) => {
        setCommandes((prev) =>
            prev.map((c) => c.id === id ? { ...c, status: newStatus } : c)
        );
    }, []);

    const assignLivreur = useCallback((commandeId, livreurId) => {
        setCommandes((prev) =>
            prev.map((c) => c.id === commandeId ? { ...c, livreurId } : c)
        );
    }, []);

    const updateCommandeNotes = useCallback((id, notes) => {
        setCommandes((prev) =>
            prev.map((c) => c.id === id ? { ...c, notes } : c)
        );
    }, []);

    const cancelCommande = useCallback((id) => {
        setCommandes((prev) =>
            prev.map((c) => c.id === id ? { ...c, status: "cancelled" } : c)
        );
    }, []);

    /* ── Produits ── */
    const toggleProduitActif = useCallback((id) => {
        setProduits((prev) =>
            prev.map((p) => p.id === id ? { ...p, actif: !p.actif } : p)
        );
    }, []);

    const updateProduit = useCallback((id, updates) => {
        setProduits((prev) =>
            prev.map((p) => p.id === id ? { ...p, ...updates } : p)
        );
    }, []);

    const addProduit = useCallback((produit) => {
        const id = produit.type === "boisson" ? "BOI" : produit.type === "location" ? "LOC" : "SRV";
        setProduits((prev) => [
            ...prev,
            { ...produit, id: `${id}-${String(prev.length + 1).padStart(3, "0")}` },
        ]);
    }, []);

    const deleteProduit = useCallback((id) => {
        setProduits((prev) => prev.filter((p) => p.id !== id));
    }, []);

    /* ── Clients ── */
    const toggleClientActif = useCallback((id) => {
        setClients((prev) =>
            prev.map((c) => c.id === id ? { ...c, actif: !c.actif } : c)
        );
    }, []);

    /* ── Livreurs ── */
    const toggleLivreurActif = useCallback((id) => {
        setLivreurs((prev) =>
            prev.map((l) => l.id === id ? { ...l, actif: !l.actif } : l)
        );
    }, []);

    /* ── Stats calculées (mémoïsées) ── */
    const stats = useMemo(() => {
        const actives = commandes.filter((c) => c.status !== "cancelled");
        const delivered = commandes.filter((c) => c.status === "delivered");
        const pending = commandes.filter((c) => c.status === "pending");
        const inProgress = commandes.filter((c) => ["confirmed", "preparing", "shipping"].includes(c.status));

        const caTotal = actives.reduce((sum, c) => sum + getCommandeTTC(c), 0);
        const caDelivered = delivered.reduce((sum, c) => sum + getCommandeTTC(c), 0);

        // CA par jour (7 derniers jours)
        const caParJour = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            caParJour[key] = 0;
        }
        delivered.forEach((c) => {
            if (caParJour[c.date] !== undefined) caParJour[c.date] += getCommandeTTC(c);
        });

        // Répartition par type
        const parType = { boisson: 0, location: 0, service: 0 };
        actives.forEach((c) => {
            c.items.forEach((item) => {
                const produit = PRODUITS_INIT.find((p) => p.id === item.produitId);
                if (produit) parType[produit.type] = (parType[produit.type] || 0) + item.price * item.qty;
            });
        });

        // Répartition paiements
        const parPaiement = { mtn: 0, moov: 0, cash: 0 };
        actives.forEach((c) => { parPaiement[c.paymentMethod] = (parPaiement[c.paymentMethod] || 0) + getCommandeTTC(c); });

        // Alertes
        const stockFaibles = produits.filter((p) => p.stock !== null && p.stock <= 5);

        return {
            totalCommandes: commandes.length,
            commandesActives: actives.length,
            commandesEnCours: inProgress.length,
            commandesLivrees: delivered.length,
            commandesAttente: pending.length,
            caTotal,
            caDelivered,
            caParJour,
            parType,
            parPaiement,
            totalClients: clients.length,
            stockFaibles,
            tauxSatisfaction: commandes.length > 0
                ? Math.round((delivered.length / commandes.filter(c => c.status !== "pending").length) * 100)
                : 0,
        };
    }, [commandes, produits, clients]);

    return (
        <DataContext.Provider value={{
            // Données
            commandes, produits, clients, livreurs,
            // Commandes
            updateCommandeStatus, assignLivreur, updateCommandeNotes, cancelCommande,
            // Produits
            toggleProduitActif, updateProduit, addProduit, deleteProduit,
            // Clients
            toggleClientActif,
            // Livreurs
            toggleLivreurActif,
            // Stats
            stats,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData doit être utilisé dans <DataProvider>");
    return ctx;
}