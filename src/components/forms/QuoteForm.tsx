
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Calculator, Mic } from 'lucide-react';
import { VoiceInput } from '../VoiceInput';
import { toast } from 'sonner';
import { Quote, QuoteItem, QuoteStatus } from '../../types';


interface QuoteFormProps {
  onSuccess: () => void;
  quote?: Quote;
}

export function QuoteForm({ onSuccess, quote }: QuoteFormProps) {
  const { clients, services, materials, addQuote, updateQuote } = useStore();
  const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
  const [formData, setFormData] = useState<Partial<Quote>>(
    quote || {
      clientId: '',
      description: '',
      validity: '30 dias',
      laborValue: 0,
      shippingValue: 0,
      discount: 0,
      status: 'PENDING',
      warranty: '90 dias',
      executionTime: '2 dias úteis',
    }
  );

  const calculateTotal = () => {
    const itemsTotal = items.reduce((acc, item) => acc + item.total, 0);
    const subtotal = itemsTotal + (formData.laborValue || 0) + (formData.shippingValue || 0);
    return subtotal - (formData.discount || 0);
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitValue: 0,
      total: 0,
      type: 'material',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        
        // Auto-fill from catalog if description (acting as ID selection here) changes
        if (field === 'description') {
           if (item.type === 'service') {
              const service = services.find(s => s.id === value || s.name === value);
              if (service) {
                 updatedItem.description = service.name;
                 updatedItem.unitValue = service.price;
              }
           } else {
              const material = materials.find(m => m.id === value || m.name === value);
              if (material) {
                 updatedItem.description = material.name;
                 updatedItem.unitValue = material.price;
              }
           }
        }

        if (field === 'quantity' || field === 'unitValue' || field === 'description') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitValue;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast.error('O cliente é obrigatório');
      return;
    }

    const quoteData = {
      ...formData,
      id: quote?.id || `ORC-${Math.floor(1000 + Math.random() * 9000)}`,
      items,
      totalValue: calculateTotal(),
      date: quote?.date || new Date().toISOString(),
      createdAt: quote?.createdAt || new Date().toISOString(),
    } as Quote;

    if (quote) {
      updateQuote(quoteData);
      toast.success('Orçamento atualizado!');
    } else {
      addQuote(quoteData);
      toast.success('Orçamento gerado com sucesso!');
    }
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label>Selecione o Cliente</Label>
          <Select 
            value={formData.clientId} 
            onValueChange={(val) => setFormData({ ...formData, clientId: val })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione um cliente..." />
            </SelectTrigger>
            <SelectContent className="bg-card">
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="status">Status do Orçamento</Label>
          <Select 
            value={formData.status} 
            onValueChange={(val) => setFormData({ ...formData, status: val as QuoteStatus })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status..." />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="APPROVED">Aprovado</SelectItem>
              <SelectItem value="REJECTED">Recusado</SelectItem>
              <SelectItem value="ANALYSIS">Em Análise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Descrição do Serviço</Label>
            <VoiceInput onTranscript={(text) => setFormData({ ...formData, description: (formData.description ? formData.description + ' ' : '') + text })} />
          </div>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Ex: Reforma elétrica residencial completa..." 
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            Itens do Orçamento
          </h3>
          <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-8 gap-1">
            <Plus className="w-3 h-3" /> Add Item
          </Button>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-3 bg-secondary/20 rounded-lg border border-primary/5 space-y-3">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-3">
                  <Label className="text-[10px] mb-1 block">Tipo</Label>
                  <Select 
                    value={item.type} 
                    onValueChange={(val) => updateItem(item.id, 'type', val)}
                  >
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 sm:col-span-9">
                  <Label className="text-[10px] mb-1 block">Item do Catálogo / Descrição</Label>
                    <div className="flex flex-col flex-1 gap-2">
                      <div className="flex items-center gap-2">
                        <Select 
                          onValueChange={(val) => updateItem(item.id, 'description', val)}
                        >
                          <SelectTrigger className="h-9 bg-background flex-1">
                            <SelectValue placeholder={`Escolher ${item.type === 'service' ? 'serviço' : 'material'}...`} />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                            {item.type === 'service' ? (
                              services.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} (R$ {s.price})</SelectItem>
                              ))
                            ) : (
                              materials.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name} (R$ {m.price})</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <VoiceInput onTranscript={(text) => updateItem(item.id, 'description', (item.description ? item.description + ' ' : '') + text)} />
                      </div>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Ou digite manualmente..."
                        className="h-9 flex-1"
                      />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <Label className="text-[10px] mb-1 block">Qtd</Label>
                  <Input 
                    type="number"
                    value={item.quantity === 0 ? '' : item.quantity} 
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="col-span-5">
                  <Label className="text-[10px] mb-1 block">Vlr. Un (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={item.unitValue === 0 ? '' : item.unitValue} 
                    onChange={(e) => updateItem(item.id, 'unitValue', Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2">
                   <Label className="text-[10px] mb-1 block">Total (R$)</Label>
                   <div className="h-9 flex items-center font-bold text-primary text-sm">
                      {(item.total || 0).toFixed(2)}
                   </div>
                </div>
                <div className="col-span-1 flex items-end pb-0.5">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
             <div className="text-center p-6 border-2 border-dashed border-primary/10 rounded-xl text-muted-foreground text-sm">
                Nenhum item adicionado ao orçamento.
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <div className="space-y-2">
          <Label className="text-xs">Mão de Obra (R$)</Label>
          <Input 
            type="number"
            value={formData.laborValue === 0 ? '' : formData.laborValue} 
            onChange={(e) => setFormData({ ...formData, laborValue: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Deslocamento (R$)</Label>
          <Input 
            type="number"
            value={formData.shippingValue === 0 ? '' : formData.shippingValue} 
            onChange={(e) => setFormData({ ...formData, shippingValue: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Desconto (R$)</Label>
          <Input 
            type="number"
            value={formData.discount === 0 ? '' : formData.discount} 
            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col justify-end items-end p-2">
           <span className="text-[10px] uppercase text-muted-foreground font-bold">Total Final</span>
           <span className="text-2xl font-black text-primary">R$ {calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
         <div className="space-y-2">
           <Label htmlFor="validity" className="text-xs">Validade</Label>
           <Input id="validity" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} />
         </div>
         <div className="space-y-2">
           <Label htmlFor="warranty" className="text-xs">Garantia</Label>
           <Input id="warranty" value={formData.warranty} onChange={(e) => setFormData({ ...formData, warranty: e.target.value })} />
         </div>
         <div className="space-y-2">
           <Label htmlFor="executionTime" className="text-xs">Prazo Exec.</Label>
           <Input id="executionTime" value={formData.executionTime} onChange={(e) => setFormData({ ...formData, executionTime: e.target.value })} />
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold gap-2">
          <Calculator className="w-4 h-4" />
          {quote ? 'Atualizar Orçamento' : 'Salvar e Gerar PDF'}
        </Button>
      </div>
    </form>
  );
}
