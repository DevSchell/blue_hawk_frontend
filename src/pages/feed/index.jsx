import {BookOpen, Calendar, Clock, Dices, PlusCircle, ShoppingBag, Swords, User} from "lucide-react";
import React from "react";


export default function FeedPage({ username, onLogout }) {
  return (
      <div className="relative z-0 min-h-screen flex flex-col">

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
                      <span className="text-sm font-semibold text-amber-100">{username}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#1e2d4a] border-2 border-[#c59b27] flex items-center justify-center font-bold text-amber-200 shadow-lg cursor-pointer hover:border-amber-400 transition-colors">
                      {username.substring(0, 2).toUpperCase()}
                  </div>
                  <button
                          onClick={onLogout}
                          className="ml-2 text-xs bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded transition-all"
                      >
                          Sair
                  </button>
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
  )
}