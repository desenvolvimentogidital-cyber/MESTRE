
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { InventoryItem } from '../../types';


interface InventoryFormProps {
  onSuccess: () => void;
  item?: InventoryItem;
}

export function InventoryForm({ onSuccess, item }: InventoryFormProps) {
  const { addInventoryItem, updateInventoryItem } = useStore();
  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    item || {
      name: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
      costPrice: 0,
      salePrice: 0,
      code: '',
      supplier: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('O nome do item é obrigatório');
      return;
    }

    const itemData = {
      ...formData,
      id: item?.id || Math.random().toString(36).substr(2, 9),
    } as InventoryItem;

    if (item) {
      updateInventoryItem(itemData);
      toast.success('Item atualizado com sucesso!');
    } else {
      addInventoryItem(itemData);
      toast.success('Item adicionado ao estoque!');
    }
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Nome do Material/Ferramenta</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Ex: Cabo Flexível 2.5mm" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input 
            id="category" 
            value={formData.category} 
            onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
            placeholder="Ex: Fios, Disjuntores" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Código/Referência</Label>
          <Input 
            id="code" 
            value={formData.code} 
            onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
            placeholder="Ex: ELE-001" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade Atual</Label>
          <Input 
            id="quantity" 
            type="number"
            value={formData.quantity} 
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Qtd. Mínima (Alerta)</Label>
          <Input 
            id="minQuantity" 
            type="number"
            value={formData.minQuantity} 
            onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
          <Input 
            id="costPrice" 
            type="number"
            step="0.01"
            value={formData.costPrice} 
            onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
          <Input 
            id="salePrice" 
            type="number"
            step="0.01"
            value={formData.salePrice} 
            onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })} 
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input 
            id="supplier" 
            value={formData.supplier} 
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} 
            placeholder="Ex: Loja Elétrica X" 
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold">Salvar Item</Button>
      </div>
    </form>
  );
}
