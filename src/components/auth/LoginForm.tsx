import React from 'react';

export const LoginForm = ({ onLogin }: { onLogin: (e: React.FormEvent<HTMLFormElement>) => void }) => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border-t-8 border-amber-400">
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
          <label className="label-base">CIM</label>
          <input 
            name="cim" 
            required 
            placeholder="Seu número de cadastro"
            className="input-base" 
          />
        </div>
        <div>
          <label className="label-base">Senha</label>
          <input 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••"
            className="input-base" 
          />
        </div>
        <div>
          <label className="label-base">Palavra Semestral</label>
          <input 
            name="palavraSemestral"
            type="password" 
            required 
            placeholder="••••••••"
            className="input-base" 
          />
        </div>
        <button type="submit" className="btn-primary w-full justify-center text-lg">
          Entrar
        </button>
      </form>
      <p className="text-center text-xs text-slate-400 mt-8">
        Humildade e Justiça - Gestão Maçônica v1.0
      </p>
    </div>
  </div>
);
