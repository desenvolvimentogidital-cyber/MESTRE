
import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export function AdBanner() {
  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-primary/20 rounded-2xl p-6 mb-8 relative overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <div className="bg-primary shadow-[0_0_20px_rgba(250,204,21,0.3)] p-4 rounded-2xl hidden md:block rotate-3 group-hover:rotate-0 transition-transform">
            <Tag className="w-8 h-8 text-black" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded">Novidade</span>
              <h4 className="text-xl font-black text-white tracking-tight uppercase italic">Revisão Preventiva!</h4>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl">Evite surpresas e garanta a segurança da sua instalação elétrica com nossos especialistas. Descontos de até 15% para novos clientes.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-tighter rounded-md">
            Oferta Especial
          </div>
        </div>
      </div>
    </div>
  );
}
