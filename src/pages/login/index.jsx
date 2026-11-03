import React, { useState } from 'react';
import {
    Shield,
    Crown,
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

export default function App() {
    // Form states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Handle Form Submission
    const handleSubmit = (e) => {
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

        // Simulate login request delay
        setTimeout(() => {
            setIsLoading(false);
            setIsLoggedIn(true);
        }, 1200);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0705] font-serif text-slate-100 overflow-hidden select-none">
            {/* Fixed, non-scrollable normal background image */}
            <div
                className="fixed inset-0 bg-cover bg-center brightness-[0.45]"
                style={{
                    backgroundImage: `radial-gradient(circle at center, rgba(30, 20, 15, 0.4) 0%, rgba(10, 7, 5, 0.95) 100%), url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1920&auto=format&fit=crop')`
                }}
            />

            {/* BACKGROUND CONTENT: Simulated Blue Hawk Tavern Dashboard */}
            <div className={`relative z-0 min-h-screen flex flex-col transition-all duration-500 ${!isLoggedIn ? 'filter blur-[4px] pointer-events-none brightness-75 scale-[0.99]' : ''}`}>

                {/* Top Navbar */}
                <header className="w-full bg-[#121620]/90 border-b border-[#3b2d1d] px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-md">
                    {/* Logo Brand */}
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded bg-[#1a2942] border border-[#c59b27]/60 flex items-center justify-center shadow-md">
                            {/* Hawk Icon SVG */}
                            <svg className="w-6 h-6 text-[#e2c775]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-5.45 8-12V5l-8-3zm0 3.2l5 1.9v4.9c0 3.8-2.6 7.4-5 8.5-2.4-1.1-5-4.7-5-8.5V7.1l5-1.9z"/>
                                <path d="M10 9l4 2-2 3 4 1-5 3v-4l2-1-3-2z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-bold tracking-widest text-lg text-amber-100 flex items-center gap-1">
                                <span className="text-[#c59b27] text-xs">◆</span> BLUE HAWK <span className="text-[#c59b27] text-xs">◆</span>
                            </h1>
                            <p className="text-[10px] tracking-wider text-amber-200/60 uppercase -mt-1 font-sans">Taverna de Boardgames</p>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <button className="px-4 py-2 text-xs font-semibold tracking-wider text-[#e2c775] border-b-2 border-[#c59b27] flex items-center gap-2 bg-[#1b2538]/50">
                            <BookOpen className="w-3.5 h-3.5" /> MINHA COLEÇÃO
                        </button>
                        <button className="px-4 py-2 text-xs font-semibold tracking-wider text-amber-200/70 hover:text-amber-100 flex items-center gap-2 transition-colors">
                            <ShoppingBag className="w-3.5 h-3.5" /> MERCADO
                        </button>
                        <button className="px-4 py-2 text-xs font-semibold tracking-wider text-amber-200/70 hover:text-amber-100 flex items-center gap-2 transition-colors">
                            <Swords className="w-3.5 h-3.5" /> PARTIDAS
                        </button>
                    </nav>

                    {/* User Profile / Status */}
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-amber-200/50 uppercase tracking-widest block">Aventureiro</span>
                            <span className="text-sm font-semibold text-amber-100">{isLoggedIn ? username : 'Lord Roderick'}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#1e2d4a] border-2 border-[#c59b27] flex items-center justify-center font-bold text-amber-200 shadow-lg cursor-pointer hover:border-amber-400 transition-colors">
                            {isLoggedIn ? username.substring(0, 2).toUpperCase() : 'LR'}
                        </div>
                        {isLoggedIn && (
                            <button
                                onClick={handleLogout}
                                className="ml-2 text-xs bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded transition-all"
                            >
                                Sair
                            </button>
                        )}
                    </div>
                </header>

                {/* Dashboard Main View */}
                <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
                    {/* Top Filter Bar */}
                    <div className="bg-[#141b2b]/80 border border-[#3b2d1d] rounded p-4 flex flex-wrap gap-4 items-center justify-between shadow-xl">
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <label className="text-[10px] text-amber-200/50 uppercase tracking-wider block mb-1">Visualizar Acervo</label>
                                <div className="bg-[#0f172a] border border-[#2e3b52] text-amber-100 text-xs px-3 py-2 rounded flex items-center gap-2 min-w-[200px]">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Jogos na Estante
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-amber-200/50 uppercase tracking-wider block mb-1">Buscar por Título</label>
                                <input
                                    type="text"
                                    placeholder="Buscar jogo..."
                                    disabled
                                    className="bg-[#0f172a] border border-[#2e3b52] text-amber-100 text-xs px-3 py-2 rounded min-w-[220px]"
                                />
                            </div>
                        </div>

                        <button className="bg-gradient-to-r from-[#8b3a24] to-[#632313] border border-[#d4af37] text-amber-100 px-5 py-2.5 rounded font-semibold text-xs tracking-wider flex items-center gap-2 shadow-lg">
                            <PlusCircle className="w-4 h-4" /> CADASTRAR BOARDGAME
                        </button>
                    </div>

                    {/* Boardgame Cards Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Dungeon Dice Card */}
                        <div className="bg-[#141d30]/90 border border-[#8b3a24] rounded-lg overflow-hidden shadow-2xl flex flex-col">
                            <div className="bg-gradient-to-r from-[#7a2a18] to-[#4a170d] px-4 py-2.5 border-b border-[#a8442c] flex justify-between items-center">
                                <h3 className="font-bold tracking-widest text-amber-100 text-sm">DUNGEON DICE</h3>
                                <span className="text-[10px] bg-[#9e3a20] text-amber-100 px-2 py-0.5 rounded font-sans tracking-wide">NA ESTANTE</span>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="bg-[#0d1424] rounded border border-[#24334f] p-8 flex items-center justify-center mb-4">
                                    <div className="w-24 h-24 bg-slate-200 rounded-lg border-2 border-slate-400 flex items-center justify-center shadow-inner relative transform rotate-6">
                                        <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-amber-100/70 leading-relaxed flex-1 font-sans">
                                    Enfrente monstros épicos e suba de nível rolando dados mágicos nesta aventura de masmorra acelerada.
                                </p>
                                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#222f47] text-xs text-amber-200/80 font-sans">
                  <span className="bg-[#1c2942] px-2.5 py-1 rounded border border-[#35486d] flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400" /> 1-4
                  </span>
                                    <span className="bg-[#1c2942] px-2.5 py-1 rounded border border-[#35486d] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> 45-60 min
                  </span>
                                    <span className="bg-[#1c2942] px-2.5 py-1 rounded border border-[#35486d] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> 2021
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Placeholder Card 2 */}
                        <div className="bg-[#141d30]/50 border border-[#2e3b52] rounded-lg p-6 flex flex-col justify-center items-center text-center opacity-60">
                            <Dices className="w-12 h-12 text-amber-200/30 mb-3" />
                            <p className="text-xs text-amber-200/50">Mais boardgames em sua estante da taverna...</p>
                        </div>
                    </div>
                </main>

                {/* Footer info */}
                <footer className="text-center py-3 text-[11px] text-amber-200/30 border-t border-[#221a14] font-sans">
                    BLUE HAWK © 2026 — TAVERNA DE BOARDGAMES
                </footer>
            </div>

            {/* LOGIN MODAL (OVERLAY) */}
            {!isLoggedIn && (
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
            )}
        </div>
    );
}