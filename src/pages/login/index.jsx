import React, { useState } from 'react';
import {
    BookOpen,
    ShoppingBag,
    Swords,
    User,
    PlusCircle,
    Dices,
    Clock,
    Calendar,
    Sparkles,
    KeyRound,
    Eye,
    EyeOff
} from 'lucide-react';

export default function LoginPage({ onLogin }) {
    // Form states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!username.trim()) {
            setErrorMessage('Por favor, informe o nome.');
            return;
        }
        if (!password) {
            setErrorMessage('Por favor, insira a sua senha.');
            return;
        }

        setIsLoading(true);

        const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        const configuredEndpoint = import.meta.env.VITE_LOGIN_ENDPOINT || '/api/auth/login';
        const loginEndpoint = configuredEndpoint.startsWith('/')
            ? configuredEndpoint
            : `/${configuredEndpoint}`;

        try {
            const response = await fetch(`${apiUrl}${loginEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                if (!response.ok) {
                    throw new Error('A API retornou uma resposta inválida.');
                }
            }

            const payload = data && typeof data === 'object' ? data : {};

            if (!response.ok) {
                throw new Error(
                    payload.message || payload.error || 'Nome ou senha inválidos.'
                );
            }

            onLogin(
                payload.user?.username || payload.username || username.trim(),
                payload.token || payload.accessToken
            );
        } catch (error) {
            setErrorMessage(
                error instanceof TypeError
                    ? 'Não foi possível conectar ao servidor.'
                    : error.message
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fadeIn">

                    {/* Main Card Container */}
                    <div className="relative w-full max-w-md bg-[#162542] rounded-lg border-2 border-[#c59b27]/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300">

                        {/* Outer Accent Gold Border Inner Layer */}
                        <div className="absolute inset-1 border border-[#c59b27]/30 rounded pointer-events-none z-10" />

                        {/* Bottom Corner Diamond Ornaments */}
                        <div className="absolute bottom-2 left-2 text-[#c59b27] text-[10px] z-20 opacity-80">❖</div>
                        <div className="absolute bottom-2 right-2 text-[#c59b27] text-[10px] z-20 opacity-80">❖</div>

                        {/* Content Container */}
                        <div className="relative z-20 px-8 pt-10 pb-9 flex flex-col items-center">

                            {/* Crest / Shield Emblem Header */}
                            <div className="relative mb-5 group cursor-default">
                                {/* Shield Background */}
                                <div className="w-20 h-24 bg-gradient-to-b from-[#1c2e4f] to-[#0c1628] rounded-b-full border-2 border-[#3d5580] shadow-2xl flex items-center justify-center relative overflow-hidden">

                                    {/* Subtle Inner Highlight */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/5 to-transparent" />

                                    {/* White Hawk Silhouette */}
                                    <svg className="w-12 h-12 text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transform group-hover:scale-105 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                        {/* Stylized Hawk / Falcon */}
                                        <path d="M12 2C8 2 4 5 3 9c3-1 6-1 8 1-4 1-6 4-6 7 3-1 6 0 8 2 1-3 3-6 7-8-3 0-5-2-6-4 3 0 5-2 6-5-3 0-6 1-8 0z" />
                                        <path d="M11 4.5C9.5 4.5 7 6 6 8c2.5-.5 4.5.5 5.5 2 0-2 1-4.5 3-5.5-1.5-.5-2.5-.5-3.5-0zm-3 7.5c-2 0-3.5 1-4 2.5 1.5 0 3 .5 4 1.5.5-1.5 1.5-2.5 3-3-1-.5-2-.5-3-1z" fill="#0f172a" />
                                    </svg>
                                </div>
                                {/* Shield Top Ornament */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#c59b27] rounded-full shadow-glow" />
                            </div>

                            {/* Title & Subtitle */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold tracking-widest text-slate-100 flex items-center justify-center gap-2 drop-shadow-md">
                                    <span className="text-[#c59b27] text-xs">◆</span>
                                    <span>BLUE HAWK</span>
                                    <span className="text-[#c59b27] text-xs">◆</span>
                                </h2>
                                <p className="text-[11px] tracking-[0.25em] text-amber-200/70 uppercase font-sans mt-1">
                                    TAVERNA DE BOARDGAMES
                                </p>
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="w-full mb-5 bg-red-950/80 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded text-center font-sans animate-shake">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="w-full space-y-5">

                                {/* Field 1: Nome do Aventureiro */}
                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-amber-200/90 uppercase mb-2 font-sans">
                                        NOME DO AVENTUREIRO
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Ex: Lord Roderick"
                                            className="w-full bg-[#0d182b] border border-[#2b3e61] focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27] rounded-md px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 font-sans shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Field 2: Palavra-Passe / Runa */}
                                <div>
                                    <label className="block text-[11px] font-bold tracking-wider text-amber-200/90 uppercase mb-2 font-sans">
                                        PALAVRA-PASSE / RUNA
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-[#0d182b] border border-[#2b3e61] focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27] rounded-md px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 font-sans shadow-inner pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-200 transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full relative group overflow-hidden bg-gradient-to-r from-[#943a1f] via-[#7a2c16] to-[#591e0e] hover:from-[#a84325] hover:to-[#6b2512] active:from-[#6b2512] active:to-[#451307] border-2 border-[#d4af37] rounded-md py-3.5 px-4 font-bold tracking-widest text-amber-100 text-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-200 uppercase cursor-pointer"
                                    >
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                        <span className="relative flex items-center justify-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {isLoading ? (
                          <>
                              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                              ADENTRANDO...
                          </>
                      ) : (
                          'ADENTRAR A TAVERNA'
                      )}
                    </span>
                                    </button>
                                </div>
                            </form>

                            {/* Bottom Helper Links */}
                            <div className="mt-6 flex items-center justify-between w-full text-[11px] font-sans text-amber-200/60 pt-4 border-t border-[#1e3256]">
                                <a href="#recuperar" onClick={(e) => { e.preventDefault(); alert('Solicite a recuperação com o Mestre da Taverna!'); }} className="hover:text-amber-300 transition-colors hover:underline">
                                    Esqueceu a runa?
                                </a>
                                <a href="#cadastrar" onClick={(e) => { e.preventDefault(); alert('Abra uma nova conta no balcão!'); }} className="hover:text-amber-300 transition-colors hover:underline flex items-center gap-1">
                                    <KeyRound className="w-3 h-3 text-[#c59b27]" /> Criar conta
                                </a>
                            </div>

                        </div>
                    </div>
        </div>
    );
}