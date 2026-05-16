
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';


interface ServiceFormProps {
  onSuccess: () => void;
  service?: any;
}

export function ServiceForm({ onSuccess, service }: ServiceFormProps) {
  const { addService, updateService } = useStore();
  const [formData, setFormData] = useState({
    name: service?.name || '',
    category: service?.category || '',
    price: service?.price || 0,
    status: service?.status || 'Ativo',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('O nome do serviço é obrigatório');
      return;
    }

    const serviceData = {
      ...formData,
      id: service?.id || Math.random().toString(36).substr(2, 9),
      userId: service?.userId
    };

    if (service) {
      updateService(serviceData as any);
      toast.success('Serviço atualizado!');
    } else {
      addService(serviceData);
      toast.success('Serviço cadastrado com sucesso!');
    }
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Serviço</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          placeholder="Ex: Instalação de Ar Condicionado" 
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
            placeholder="Ex: Instalação, Manutenção" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço Padrão (R$)</Label>
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
        <Button type="submit" className="bg-primary text-black font-bold">Salvar Serviço</Button>
      </div>
    </form>
  );
}
