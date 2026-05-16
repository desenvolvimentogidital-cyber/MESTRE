
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStore } from '../store/useStore';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Wallet, Plus, Download, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { TransactionForm } from './forms/TransactionForm';

export function Financeiro() {
  const { transactions, toggleTransactionPaid, deleteTransaction } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setIsFormOpen(true);
  };

  const handleTogglePaid = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      toggleTransactionPaid(id, transaction.isPaid);
      toast.success('Status de pagamento atualizado!');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    toast.warning('Excluir esta movimentação?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteTransaction(id);
          toast.success('Movimentação excluída!');
        },
      },
      duration: 5000,
    });
  };

  const handleExport = () => {
    toast.success('Exportando relatório financeiro...');
  };

  const incomes = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const balance = incomes - expenses;

  const data = [
    { name: 'Entradas', value: incomes, color: '#22c55e' },
    { name: 'Saídas', value: expenses, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">Controle seu fluxo de caixa e lucros.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={() => handleTransaction('INCOME')} className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Entrada
          </Button>
          <Button onClick={() => handleTransaction('EXPENSE')} className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Saída
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">R$ {incomes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">R$ {expenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Geral</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {balance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-primary/10">
          <CardHeader>
             <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/10">
          <CardHeader>
             <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell>
                       <div className="font-medium text-sm">{t.description}</div>
                       <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className={cn("text-sm font-bold", t.type === 'INCOME' ? 'text-green-500' : 'text-red-500')}>
                       {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                    </TableCell>
                    <TableCell>
                       <Badge 
                        onClick={() => handleTogglePaid(t.id)}
                        variant={t.isPaid ? 'default' : 'outline'} 
                        className={cn("cursor-pointer", t.isPaid ? 'bg-green-500/10 text-green-500 border-green-500/20' : '')}
                       >
                         {t.isPaid ? 'Pago' : 'Pendente'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-all border border-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransaction(t.id);
                        }}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Novo Lançamento
            </DialogTitle>
          </DialogHeader>
          <TransactionForm 
            onSuccess={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

