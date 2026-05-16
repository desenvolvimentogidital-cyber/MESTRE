
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';


interface AppointmentFormProps {
  onSuccess: () => void;
  initialDate?: Date;
}

export function AppointmentForm({ onSuccess, initialDate }: AppointmentFormProps) {
  const { clients, addOS } = useStore();
  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '08:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    // Creating an OS from an appointment
    addOS({
      id: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: formData.clientId,
      responsibleId: '1',
      description: formData.description,
      scheduledDate: formData.date,
      scheduledTime: formData.time,
      status: 'SCHEDULED',
      usedMaterials: [],
      technicalNotes: '',
      checklist: [],
      photosBefore: [],
      photosAfter: [],
      items: [],
      totalValue: 0,
      createdAt: new Date().toISOString(),
    });

    toast.success('Agendamento realizado com sucesso!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Cliente</Label>
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
      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Compromisso</Label>
        <Input 
          id="description" 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          placeholder="Ex: Visita técnica para orçamento" 
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input 
            id="date" 
            type="date"
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Horário</Label>
          <Input 
            id="time" 
            type="time"
            value={formData.time} 
            onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold">Salvar Agendamento</Button>
      </div>
    </form>
  );
}
