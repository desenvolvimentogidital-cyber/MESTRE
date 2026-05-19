
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { VoiceInput } from '../VoiceInput';
import { toast } from 'sonner';

interface MaterialFormProps {
  onSuccess: () => void;
  material?: any;
}

export function MaterialForm({ onSuccess, material }: MaterialFormProps) {
  const { addMaterial, updateMaterial, settings } = useStore();
  const [formData, setFormData] = useState({
    name: material?.name || '',
    unit: material?.unit || 'Unidade',
    costPrice: material?.costPrice || 0,
    price: material?.price || 0,
    category: material?.category || '',
    status: material?.status || 'Ativo',
  });

  const calculateSalePrice = (cost: number) => {
    const tax = (settings?.productTax || 0) / 100;
    const margin = (settings?.defaultMargin || 0) / 100;
    // Custo -> Imposto -> Margem
    const costWithTax = cost * (1 + tax);
    return costWithTax * (1 + margin);
  };

  const handleCostChange = (val: string) => {
    const cost = Number(val);
    const salePrice = calculateSalePrice(cost);
    setFormData(prev => ({ ...prev, costPrice: cost, price: Number(salePrice.toFixed(2)) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('O nome do material é obrigatório');
      return;
    }

    const materialData = {
      ...formData,
      id: material?.id || Math.random().toString(36).substr(2, 9),
      userId: material?.userId
    };

    if (material) {
      updateMaterial(materialData as any);
      toast.success('Material atualizado!');
    } else {
      addMaterial(materialData);
      toast.success('Material cadastrado com sucesso!');
    }
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Nome do Material</Label>
          <VoiceInput onTranscript={(text) => setFormData({ ...formData, name: (formData.name ? formData.name + ' ' : '') + text })} />
        </div>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          placeholder="Ex: Cabo Flexível 2.5mm" 
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="category">Categoria</Label>
            <VoiceInput onTranscript={(text) => setFormData({ ...formData, category: (formData.category ? formData.category + ' ' : '') + text })} />
          </div>
          <Input 
            id="category" 
            value={formData.category} 
            onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
            placeholder="Ex: Fios, Iluminação" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Input 
            id="unit" 
            value={formData.unit} 
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
            placeholder="Ex: Unidade, Metro, Rolo" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
          <Input 
            id="costPrice" 
            type="number"
            step="0.01"
            value={formData.costPrice === 0 ? '' : formData.costPrice} 
            onChange={(e) => handleCostChange(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda (R$)</Label>
          <Input 
            id="price" 
            type="number"
            step="0.01"
            value={formData.price === 0 ? '' : formData.price} 
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Imposto: {settings?.productTax || 0}% + Margem: {settings?.defaultMargin || 0}%
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input 
            id="status" 
            value={formData.status} 
            onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold">Salvar Material</Button>
      </div>
    </form>
  );
}
