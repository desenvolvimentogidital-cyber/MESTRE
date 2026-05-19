
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { VoiceInput } from '../VoiceInput';
import { toast } from 'sonner';
import { Client } from '../../types';


interface ClientFormProps {
  onSuccess: () => void;
  client?: Client;
}

export function ClientForm({ onSuccess, client }: ClientFormProps) {
  const { addClient, updateClient } = useStore();
  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      document: '',
      address: '',
      neighborhood: '',
      city: '',
      zipCode: '',
      observations: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('O nome é obrigatório');
      return;
    }

    const clientData = {
      ...formData,
      id: client?.id || Math.random().toString(36).substr(2, 9),
      createdAt: client?.createdAt || new Date().toISOString(),
    } as Client;

    if (client) {
      updateClient(clientData);
      toast.success('Cliente atualizado com sucesso!');
    } else {
      addClient(clientData);
      toast.success('Cliente cadastrado com sucesso!');
    }
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="name">Nome Completo</Label>
            <VoiceInput onTranscript={(text) => setFormData({ ...formData, name: (formData.name ? formData.name + ' ' : '') + text })} />
          </div>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Ex: João da Silva" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            placeholder="joao@exemplo.com" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">CPF / CNPJ</Label>
          <Input 
            id="document" 
            value={formData.document} 
            onChange={(e) => setFormData({ ...formData, document: e.target.value })} 
            placeholder="000.000.000-00" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            placeholder="(00) 00000-0000" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp (só números)</Label>
          <Input 
            id="whatsapp" 
            value={formData.whatsapp} 
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} 
            placeholder="5500900000000" 
          />
        </div>
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="address">Endereço</Label>
            <VoiceInput onTranscript={(text) => setFormData({ ...formData, address: (formData.address ? formData.address + ' ' : '') + text })} />
          </div>
          <Input 
            id="address" 
            value={formData.address} 
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
            placeholder="Rua, número, complemento" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input 
            id="neighborhood" 
            value={formData.neighborhood} 
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input 
            id="city" 
            value={formData.city} 
            onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
          />
        </div>
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="observations">Observações</Label>
            <VoiceInput onTranscript={(text) => setFormData({ ...formData, observations: (formData.observations ? formData.observations + ' ' : '') + text })} />
          </div>
          <Textarea 
            id="observations" 
            value={formData.observations} 
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })} 
            placeholder="Detalhes importantes sobre o cliente..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" className="bg-primary text-black font-bold">Salvar Cliente</Button>
      </div>
    </form>
  );
}
