import { useEffect, useRef } from 'react';
import { Sparkles, Eye, EyeOff, X, LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useLoginController } from '../../../controllers/useLoginController';

/**
 * Login em modal com a nova identidade Blue Hawk.
 * O estado e a chamada à API ficam no useLoginController;
 * Fecha pelo X, Esc ou clicando fora do card.
 */
export default function LoginPage({ onLogin, onClose, onSwitchToRegister }) {
    const {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        toggleShowPassword,
        isLoading,
        error: errorMessage,
        submit: handleSubmit,
    } = useLoginController(onLogin);

    const emailRef = useRef(null);
    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[3px] animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-label="Entrar no Blue Hawk"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
            <div className="relative w-full max-w-md bg-[#161E66] border border-[#2438E8] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Faixa superior açafrão */}
                <div className="h-1.5 w-full bg-[#FFB000]" />

                {/* Botão de Fechar */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar"
                    className="absolute top-4 right-4 z-30 p-1 text-[#C6D0FF] hover:text-[#FFB000] transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="px-8 pt-8 pb-8 flex flex-col items-center">
                    {/* Emblema Oficial do Corvo */}
                    <div className="w-16 h-16 bg-[#0B1147] border border-[#2438E8] flex items-center justify-center mb-3 shadow-md">
                        <svg className="w-11 h-11 text-[#C6D0FF]" viewBox="0 0 400 420" fill="currentColor">
                            <path fill="#C6D0FF" d="M236 84C284 80 344 100 378 150C384 160 384 170 380 180C366 166 344 158 320 156L256 150L258 156L328 165C338 167 344 172 344 180C320 198 290 206 264 200L284 240L254 224L268 278L236 258L248 316L214 292L222 352L186 324L186 388L150 344L138 410L112 352L84 388L78 324L40 344C56 270 56 190 92 140C124 96 180 88 236 84Z"/>
                            <path fill="#0B1147" d="M262 100C298 100 332 114 356 142C328 124 298 115 262 114Z"/>
                            <path fill="#FFB000" d="M186 108L244 128C240 146 212 150 198 136C190 128 186 118 186 108Z"/>
                            <circle fill="#0B1147" cx="219" cy="128" r="8"/>
                            <path fill="#0B1147" d="M190 164C204 182 222 190 244 190C232 200 214 204 200 200C192 190 188 176 190 164Z"/>
                            <path fill="#0B1147" d="M154 146C160 196 178 242 214 280C170 256 142 206 138 152Z"/>
                        </svg>
                    </div>

                    <h2 className="font-['Grenze_Gotisch',serif] text-3xl font-bold tracking-tight text-[#F3F4FC]">
                        Blue Hawk
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-[#FFB000] font-semibold mt-0.5">
                        Acesso à Taverna
                    </p>

                    {/* Mensagem de Erro */}
                    {errorMessage && (
                        <div role="alert" className="w-full mt-4 bg-red-950/80 border border-red-500/60 text-red-200 text-xs px-3.5 py-2.5 text-center">
                            {errorMessage}
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="w-full space-y-4 mt-5">
                        {/* E-mail */}
                        <div>
                            <label htmlFor="login-email" className="block text-xs font-bold tracking-wider text-[#C6D0FF] uppercase mb-1 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-[#FFB000]" />
                                E-mail
                            </label>
                            <input
                                ref={emailRef}
                                id="login-email"
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="aventureiro@bluehawk.com"
                                required
                                className="w-full bg-[#0B1147] border border-[#2438E8] hover:border-[#7E92FF] focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000] px-4 py-2.5 text-sm text-[#F3F4FC] placeholder-[#C6D0FF]/40 outline-none transition-all font-sans"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="login-password" className="text-xs font-bold tracking-wider text-[#C6D0FF] uppercase flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-[#FFB000]" />
                                    Senha
                                </label>
                                <a
                                    href="#recuperar"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert('Um link de recuperação será enviado para o seu e-mail cadastrado.');
                                    }}
                                    className="text-[11px] text-[#FFB000] hover:underline font-semibold"
                                >
                                    Esqueceu sua senha?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#0B1147] border border-[#2438E8] hover:border-[#7E92FF] focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000] px-4 py-2.5 text-sm text-[#F3F4FC] placeholder-[#C6D0FF]/40 outline-none transition-all pr-11 font-sans"
                                />
                                <button
                                    type="button"
                                    onClick={toggleShowPassword}
                                    aria-label={showPassword ? 'Esconder senha' : 'Exibir senha'}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#C6D0FF] hover:text-[#FFB000] transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Botão Oficial Chanfrado (.button--primary com corte de 14px) */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="button button--primary button--full flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Sparkles className="w-4 h-4 animate-spin text-[#0B1147]" />
                                        ENTRANDO...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        ENTRAR
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Rodapé: Alternar para Cadastro */}
                    <div className="mt-6 flex items-center justify-center w-full text-xs text-[#C6D0FF] pt-4 border-t border-[#2438E8]/40">
                        <span>Não possui uma conta?</span>
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="ml-2 text-[#FFB000] hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Cadastre-se
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
