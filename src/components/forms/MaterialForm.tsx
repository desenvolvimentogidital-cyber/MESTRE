
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface MaterialFormProps {
  onSuccess: () => void;
  material?: any;
}

export function MaterialForm({ onSuccess, material }: MaterialFormProps) {
  const { addMaterial, updateMaterial } = useStore();
  const [formData, setFormData] = useState({
    name: material?.name || '',
    unit: material?.unit || 'Unidade',
    price: material?.price || 0,
    category: material?.category || '',
    status: material?.status || 'Ativo',
  });

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
        <Label htmlFor="name">Nome do Material</Label>
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
          <Label htmlFor="category">Categoria</Label>
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
          <Label htmlFor="price">Preço Unitário (R$)</Label>
          <Input 
            id="price" 
            type="number"
            step="0.01"
            value={formData.price} 
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
          />
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
