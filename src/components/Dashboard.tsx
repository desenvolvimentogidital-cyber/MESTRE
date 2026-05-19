
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
  Download,
  CheckCircle2
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
  const { clients, transactions, quotes, osList, user } = useStore();
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

  const isAdmin = user?.role === 'admin';

  const stats = isAdmin ? [
    { title: 'OS Ativas', value: activeOS.toString().padStart(2, '0'), icon: ClipboardList, trend: 'Ordens em execução', color: 'text-green-500' },
    { title: 'Orçamentos pendentes', value: pendingQuotes.toString().padStart(2, '0'), icon: FileText, trend: 'Aguardando aprovação', color: 'text-zinc-400' },
    { title: 'Faturamento Total', value: `R$ ${totalFaturamento.toLocaleString()}`, icon: DollarSign, trend: 'Valor recebido', color: 'text-primary' },
    { title: 'Lucro Estimado', value: `R$ ${(totalFaturamento * 0.7).toLocaleString()}`, icon: TrendingUp, trend: 'Estimativa (70%)', color: 'text-primary' },
  ] : [
    { title: 'Minhas OS Ativas', value: activeOS.toString().padStart(2, '0'), icon: ClipboardList, trend: 'Ordens para hoje', color: 'text-green-500' },
    { title: 'OS Finalizadas', value: osList.filter(o => o.status === 'FINISHED').length.toString().padStart(2, '0'), icon: CheckCircle2, trend: 'Total entregue', color: 'text-primary' },
    { title: 'Clientes Atendidos', value: clients.length.toString().padStart(2, '0'), icon: Users, trend: 'Base de clientes', color: 'text-zinc-400' },
    { title: 'Peças em Estoque', value: '154', icon: Bolt, trend: 'Itens disponíveis', color: 'text-zinc-500' }, // Placeholder for members or real data
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Bem-vindo, {user?.name}!</p>
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
        {stats.map((stat, i) => (
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
        {isAdmin ? (
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
        ) : (
          <Card className="md:col-span-8 bg-card border-border rounded-2xl p-6">
            <CardHeader>
              <CardTitle className="text-base font-bold">Resumo Técnico</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/10 border border-primary/10">
                    <p className="text-sm font-bold flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      Status das Suas Tarefas
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase">
                       <div className="p-2 bg-green-500/10 text-green-500 rounded">HOJE: {osList.filter(o => o.scheduledDate === new Date().toISOString().split('T')[0]).length}</div>
                       <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded">PENDENTE: {osList.filter(o => o.status === 'IN_PROGRESS').length}</div>
                       <div className="p-2 bg-blue-500/10 text-blue-500 rounded">FINAL: {osList.filter(o => o.status === 'FINISHED').length}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-primary/10">
                    <p className="text-sm font-bold flex items-center gap-2 mb-2">
                       <Calendar className="w-4 h-4 text-primary" />
                       Próximos Agendamentos
                    </p>
                    <div className="space-y-2">
                       {osList.filter(o => o.status === 'SCHEDULED').slice(0, 3).map(os => (
                         <div key={os.id} className="text-xs p-2 bg-secondary/20 rounded border border-primary/5 flex justify-between">
                            <span>{os.description}</span>
                            <span className="text-primary">{new Date(os.scheduledDate).toLocaleDateString()}</span>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-4 bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-200">
              {isAdmin ? 'Últimas Atividades' : 'Minhas Atividades'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isAdmin ? (
                transactions.slice(0, 5).map((item, i) => (
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
                ))
              ) : (
                osList.filter(o => o.status !== 'CANCELLED').slice(0, 5).map((os, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-xl transition-colors border border-primary/5 bg-secondary/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{os.description}</p>
                      <p className="text-[10px] text-zinc-500 uppercase truncate tracking-wider">{os.status}</p>
                    </div>
                    <div className="text-[10px] text-zinc-600 font-medium">{new Date(os.scheduledDate).toLocaleDateString()}</div>
                  </div>
                ))
              )}
              {((isAdmin && transactions.length === 0) || (!isAdmin && osList.length === 0)) && (
                <p className="text-center text-xs text-muted-foreground py-8">Nenhuma atividade recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
