import { useState, useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function LoginPage() {
    const { login, isAuthenticated } = useAdminAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);
    useEffect(() => { if (isAuthenticated) window.location.href = "/dashboard"; }, [isAuthenticated]);

    const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(""); };

    const handleSubmit = () => {
        if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
        setLoading(true);
        setTimeout(() => {
            const result = login(form.email, form.password);
            if (result.success) { window.location.href = "/dashboard"; }
            else { setError(result.error); setLoading(false); }
        }, 900);
    };

    const fillDemo = (role) => {
        if (role === "superadmin") setForm({ email: "admin@souaibou-distribution.bj", password: "admin123" });
        else setForm({ email: "kofi@souaibou-distribution.bj", password: "ope123" });
        setError("");
    };

    return (
        <div className="min-h-screen flex bg-neutral-9">

            {/* ── Panneau gauche décoratif ── */}
            <div className="hidden lg:flex flex-col justify-between flex-1 p-12 relative overflow-hidden"
                style={{ background: "linear-gradient(160deg,#0D0D1A 0%,#1A1A0A 60%,#0A1A0A 100%)" }}>

                {/* Orbs déco */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(255,215,0,0.08) 0%,transparent 70%)", filter: "blur(60px)" }} />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(0,128,0,0.06) 0%,transparent 70%)", filter: "blur(40px)" }} />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(255,215,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.03) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                        style={{ background: "linear-gradient(135deg,#FFD700,#E6C200)", color: "#0D0D1A", boxShadow: "0 0 20px rgba(255,215,0,0.4)" }}>
                        SD
                    </div>
                    <div>
                        <div className="font-extrabold text-sm text-white">Souaïbou Distribution</div>
                        <div className="text-xs font-medium tracking-widest uppercase text-primary-1">Administration</div>
                    </div>
                </div>

                {/* Contenu central */}
                <div className="relative z-10">
                    <h2 className="font-extrabold text-white leading-tight mb-4" style={{ fontSize: "clamp(28px,2.5vw,42px)" }}>
                        Pilotez votre activité<br />
                        <span className="text-primary-1">en temps réel</span>
                    </h2>
                    <p className="text-sm leading-relaxed max-w-md text-neutral-7">
                        Gérez vos commandes, votre catalogue, vos clients et vos livraisons depuis un seul tableau de bord.
                    </p>

                    {/* Stats déco */}
                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {[
                            { value: "300+", label: "Commandes traitées" },
                            { value: "98%", label: "Satisfaction client" },
                            { value: "2h", label: "Délai moyen" },
                        ].map(({ value, label }, i) => (
                            <div key={label}
                                className="p-4 rounded-2xl"
                                style={{
                                    background: "rgba(255,215,0,0.05)",
                                    border: "1px solid rgba(255,215,0,0.12)",
                                    opacity: mounted ? 1 : 0,
                                    transform: mounted ? "translateY(0)" : "translateY(16px)",
                                    transition: `all 0.5s ease ${i * 100 + 300}ms`,
                                }}>
                                <div className="font-extrabold text-xl text-primary-1">{value}</div>
                                <div className="text-xs mt-0.5 text-neutral-7">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-neutral-8">
                    © 2025 Souaïbou Distribution · Backoffice v1.0
                </div>
            </div>

            {/* ── Panneau droit — formulaire ── */}
            <div className="w-full lg:w-115 shrink-0 flex flex-col items-center justify-center px-6 py-10 bg-neutral-2">

                {/* Logo mobile */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                        style={{ background: "linear-gradient(135deg,#FFD700,#E6C200)", color: "#0D0D1A" }}>
                        SD
                    </div>
                    <div>
                        <div className="font-extrabold text-sm text-neutral-9">Souaïbou Distribution</div>
                        <div className="text-xs font-medium tracking-widest uppercase text-primary-1">Administration</div>
                    </div>
                </div>

                <div
                    className="w-full max-w-sm"
                    style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s ease 0.1s" }}
                >
                    <div className="mb-8">
                        <h1 className="font-extrabold text-2xl mb-1 text-neutral-9">Connexion admin</h1>
                        <p className="text-sm text-neutral-7">Accès réservé à l'équipe Souaïbou Distribution.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Email */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5 text-neutral-7">Email</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none">📧</span>
                                <input
                                    type="email"
                                    value={form.email}
                                    placeholder="votre@email.com"
                                    onChange={(e) => update("email", e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    className="admin-input pl-10"
                                    style={{ borderColor: error ? "var(--color-danger-1)" : undefined }}
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide block mb-1.5 text-neutral-7">Mot de passe</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none">🔒</span>
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={form.password}
                                    placeholder="••••••••"
                                    onChange={(e) => update("password", e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    className="admin-input pl-10 pr-10"
                                    style={{ borderColor: error ? "var(--color-danger-1)" : undefined }}
                                />
                                <button type="button" onClick={() => setShowPwd((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer text-sm text-neutral-6">
                                    {showPwd ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Erreur */}
                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium"
                                style={{ background: "var(--color-danger-2)", color: "var(--color-danger-1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary w-full justify-center mt-1"
                            style={{ paddingTop: "14px", paddingBottom: "14px" }}
                        >
                            {loading
                                ? <><span className="animate-spin inline-block">⏳</span> Connexion…</>
                                : "Se connecter →"
                            }
                        </button>
                    </div>

                    {/* Comptes démo */}
                    <div className="mt-8 p-4 rounded-2xl"
                        style={{ background: "var(--color-primary-5)", border: "1px solid var(--color-primary-4)" }}>
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-primary-7">
                            🧪 Comptes de démonstration
                        </p>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: "Super Admin", role: "superadmin", badge: "Accès total" },
                                { label: "Opérateur", role: "operateur", badge: "Commandes" },
                            ].map(({ label, role, badge }) => (
                                <button key={role} onClick={() => fillDemo(role)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border-0 cursor-pointer text-left transition-all hover:-translate-y-0.5 bg-neutral-0"
                                    style={{ border: "1px solid var(--color-primary-4)" }}>
                                    <div>
                                        <span className="font-semibold text-xs text-neutral-9">{label}</span>
                                        <span className="text-xs ml-2 text-neutral-6">{badge}</span>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-md text-primary-7"
                                        style={{ background: "var(--color-primary-5)" }}>
                                        Remplir →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-xs mt-6 text-neutral-6">
                        Accès restreint · Souaïbou Distribution © 2025
                    </p>
                </div>
            </div>
        </div>
    );
}