import React from 'react';

export const LoginForm = ({ onLogin }: { onLogin: (e: React.FormEvent<HTMLFormElement>) => void }) => (
  <div className="min-h-screen bg-lodge-dark flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border-t-8 border-lodge-gold">
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 flex items-center justify-center mx-auto">
          <img 
            src="/images/HeJ.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/masonic/200/200";
            }}
          />
        </div>
      </div>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900">A.R.L.S. Humildade e Justiça</h2>
        <p className="text-lodge-green text-xs font-bold uppercase tracking-widest mt-1">Nº 4866</p>
        <p className="text-slate-500 text-sm mt-3">Portal do Obreiro</p>
      </div>
      <form onSubmit={onLogin} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">CIM</label>
          <input 
            name="cim" 
            required 
            placeholder="Seu número de cadastro"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Senha</label>
          <input 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Palavra Semestral</label>
          <input 
            name="palavraSemestral"
            type="password" 
            required 
            placeholder="••••••••"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900" 
          />
        </div>
        <button type="submit" className="w-full py-4 bg-lodge-green text-white rounded-2xl font-bold text-lg hover:bg-lodge-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold">
          Entrar
        </button>
      </form>
      <p className="text-center text-xs text-slate-400 mt-8">
        Humildade e Justiça - Gestão Maçônica v1.0
      </p>
    </div>
  </div>
);
