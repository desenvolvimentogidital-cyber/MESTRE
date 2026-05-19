
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { VoiceInput } from '../VoiceInput';
import { toast } from 'sonner';
import { Transaction, TransactionType, TransactionCategory } from '../../types';


interface TransactionFormProps {
  onSuccess: () => void;
  transaction?: Transaction;
}

export function TransactionForm({ onSuccess, transaction }: TransactionFormProps) {
  const { addTransaction } = useStore();
  const [formData, setFormData] = useState<Partial<Transaction>>(
    transaction || {
      type: 'INCOME',
      category: 'SERVICE',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PIX',
      isPaid: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description) {
      toast.error('A descrição é obrigatória');
      return;
    }

    const transactionData = {
      ...formData,
      id: transaction?.id || Math.random().toString(36).substr(2, 9),
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
    } as Transaction;

    addTransaction(transactionData);
    toast.success(`${formData.type === 'INCOME' ? 'Receita' : 'Despesa'} registrada com sucesso!`);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="flex gap-4 p-1 bg-secondary/30 rounded-lg mb-4">
        <Button 
          type="button"
          variant={formData.type === 'INCOME' ? 'default' : 'ghost'}
          className={`flex-1 ${formData.type === 'INCOME' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
          onClick={() => setFormData({ ...formData, type: 'INCOME', category: 'SERVICE' })}
        >
          Receita
        </Button>
        <Button 
          type="button"
          variant={formData.type === 'EXPENSE' ? 'default' : 'ghost'}
          className={`flex-1 ${formData.type === 'EXPENSE' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: 'MATERIAL' })}
        >
          Despesa
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="desc">Descrição</Label>
            <VoiceInput onTranscript={(text) => setFormData({ ...formData, description: (formData.description ? formData.description + ' ' : '') + text })} />
          </div>
          <Input 
            id="desc" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Ex: Instalação Elétrica X" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select 
            value={formData.category} 
            onValueChange={(val) => setFormData({ ...formData, category: val as TransactionCategory })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Categoria..." />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="SERVICE">Serviço</SelectItem>
              <SelectItem value="MATERIAL">Material</SelectItem>
              <SelectItem value="FUEL">Combustível</SelectItem>
              <SelectItem value="TOOLS">Ferramentas</SelectItem>
              <SelectItem value="FOOD">Alimentação</SelectItem>
              <SelectItem value="OTHER">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input 
            id="amount" 
            type="number"
            step="0.01"
            value={formData.amount === 0 ? '' : formData.amount} 
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input 
            id="date" 
            type="date"
            value={formData.date?.split('T')[0]} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Forma de Pagto.</Label>
          <Select 
            value={formData.paymentMethod} 
            onValueChange={(val) => setFormData({ ...formData, paymentMethod: val as any })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Pagamento..." />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="CARD">Cartão</SelectItem>
              <SelectItem value="CASH">Dinheiro</SelectItem>
              <SelectItem value="TRANSFER">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between col-span-2 p-3 bg-secondary/20 rounded-lg border border-primary/5 mt-2">
           <Label htmlFor="paid" className="cursor-pointer">Já está pago?</Label>
           <Switch 
            id="paid" 
            checked={formData.isPaid} 
            onCheckedChange={(val) => setFormData({ ...formData, isPaid: val })}
           />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold">Salvar Lançamento</Button>
      </div>
    </form>
  );
}
