
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { OS, OSStatus } from '../../types';


interface OSFormProps {
  onSuccess: () => void;
  os?: OS;
}

export function OSForm({ onSuccess, os }: OSFormProps) {
  const { clients, user, addOS, updateOS } = useStore();
  const [formData, setFormData] = useState<Partial<OS>>(
    os || {
      clientId: '',
      responsibleId: user?.id || '1',
      description: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:00',
      status: 'SCHEDULED',
      technicalNotes: '',
      checklist: [
        { item: 'Verificar conexão elétrica', done: false },
        { item: 'Testar aterramento', done: false },
        { item: 'Limpeza do local', done: false },
      ],
      usedMaterials: [],
      items: [],
      totalValue: 0,
      photosBefore: [],
      photosAfter: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast.error('O cliente é obrigatório');
      return;
    }

    const osData = {
      ...formData,
      id: os?.id || `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: os?.createdAt || new Date().toISOString(),
    } as OS;

    if (os) {
      updateOS(osData);
      toast.success('Ordem de Serviço atualizada!');
    } else {
      addOS(osData);
      toast.success('Ordem de Serviço agendada com sucesso!');
    }
    
    onSuccess();
  };

  const toggleChecklist = (index: number) => {
    const newChecklist = [...(formData.checklist || [])];
    newChecklist[index].done = !newChecklist[index].done;
    setFormData({ ...formData, checklist: newChecklist });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
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
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(val) => setFormData({ ...formData, status: val as OSStatus })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status..." />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="SCHEDULED">Agendado</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Execução</SelectItem>
              <SelectItem value="WAITING_MATERIAL">Aguardando Material</SelectItem>
              <SelectItem value="FINISHED">Finalizado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Descrição do Problema/Serviço</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Relato do cliente ou detalhes do serviço..." 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data Agendada</Label>
          <Input 
            id="date" 
            type="date"
            value={formData.scheduledDate} 
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Horário</Label>
          <Input 
            id="time" 
            type="time"
            value={formData.scheduledTime} 
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })} 
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Checklist de Segurança / Qualidade</h3>
        <div className="space-y-2">
          {formData.checklist?.map((item, index) => (
             <div key={index} className="flex items-center space-x-2 p-2 hover:bg-secondary/20 rounded-lg transition-colors">
                <Checkbox 
                  id={`check-${index}`} 
                  checked={item.done} 
                  onCheckedChange={() => toggleChecklist(index)}
                />
                <label 
                  htmlFor={`check-${index}`}
                  className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${item.done ? 'line-through opacity-50' : ''}`}
                >
                  {item.item}
                </label>
             </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
         <Label htmlFor="notes">Notas Técnicas</Label>
         <Textarea 
          id="notes" 
          value={formData.technicalNotes} 
          onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })} 
          placeholder="Observações do técnico após a visita..." 
         />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold">
          {os ? 'Atualizar OS' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </form>
  );
}
