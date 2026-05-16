
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Bolt,
  Smartphone,
  Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const data = [
  { name: 'Jan', faturamento: 4000, servicos: 24 },
  { name: 'Fev', faturamento: 3000, servicos: 13 },
  { name: 'Mar', faturamento: 2000, servicos: 98 },
  { name: 'Abr', faturamento: 2780, servicos: 39 },
  { name: 'Mai', faturamento: 1890, servicos: 48 },
  { name: 'Jun', faturamento: 2390, servicos: 38 },
];

export function Dashboard() {
  const { clients, transactions, quotes, osList } = useStore();
  const { isInstallable, isIOS, isStandalone, isMobile, installApp } = usePWAInstall();
  
  const totalFaturamento = transactions
    .filter(t => t.type === 'INCOME' && t.isPaid)
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingQuotes = quotes.filter(q => q.status === 'PENDING').length;
  const activeOS = osList.filter(o => o.status !== 'FINISHED').length;

  const handleActivityClick = (msg: string) => {
    toast.info(`Detalhes: ${msg}`);
  };

  // Simple aggregation for chart (last 6 months or just placeholders if empty)
  const chartData = [
    { name: 'Entradas', value: transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0) },
    { name: 'Saídas', value: transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0) },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Bem-vindo ao seu sistema de gestão profissional.</p>
        </div>
        {!isStandalone && isMobile && (isInstallable || isIOS) && (
          <button 
            onClick={installApp}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-xs hover:bg-primary/20 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            {isIOS ? 'COMO INSTALAR?' : 'INSTALAR APP'}
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'OS Ativas', value: activeOS.toString().padStart(2, '0'), icon: ClipboardList, trend: 'Ordens em execução', color: 'text-green-500' },
          { title: 'Orçamentos pendentes', value: pendingQuotes.toString().padStart(2, '0'), icon: FileText, trend: 'Aguardando aprovação', color: 'text-zinc-400' },
          { title: 'Faturamento Total', value: `R$ ${totalFaturamento.toLocaleString()}`, icon: DollarSign, trend: 'Valor recebido', color: 'text-primary' },
          { title: 'Lucro Estimado', value: `R$ ${(totalFaturamento * 0.7).toLocaleString()}`, icon: TrendingUp, trend: 'Estimativa (70%)', color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className={cn("text-xs mt-2 font-medium", stat.color)}>{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-12">
        <Card className="md:col-span-8 bg-card border-border rounded-2xl p-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Faturamento x Despesas</CardTitle>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-secondary rounded text-[10px] font-bold uppercase tracking-wider">Mensal</span>
              <span className="px-3 py-1 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Anual</span>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(250, 204, 21, 0.05)' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#FACC15' }}
                />
                <Bar dataKey="value" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-200">Últimas Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {transactions.slice(0, 5).map((item, i) => (
                <div key={i} onClick={() => handleActivityClick(item.description)} className="flex items-center gap-4 group cursor-pointer hover:bg-secondary/20 p-2 rounded-xl transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    item.type === 'INCOME' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {item.type === 'INCOME' ? <DollarSign className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.description}</p>
                    <p className="text-[10px] text-zinc-500 uppercase truncate tracking-wider">R$ {item.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-[10px] text-zinc-600 font-medium">{new Date(item.date).toLocaleDateString()}</div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8">Nenhuma atividade recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
