
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Edit2, 
  Trash2,
  Filter
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ClientForm } from './forms/ClientForm';
import { VoiceInput } from './VoiceInput';
import { Client } from '../types';

export function Clientes() {
  const { clients, deleteClient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();


  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    toast.info('Redirecionando para WhatsApp...');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleNewClient = () => {
    setEditingClient(undefined);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };


  const handleDelete = (id: string) => {
    toast.warning('Deseja excluir este cliente?', {
      description: 'Esta ação não poderá ser desfeita.',
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteClient(id);
          toast.success('Cliente removido!');
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gerencie sua base de clientes.</p>
        </div>
        <Button onClick={handleNewClient} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou CPF/CNPJ..." 
            className="pl-10 pr-10 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 scale-75">
            <VoiceInput onTranscript={(text) => setSearchTerm(text)} />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} className="group transition-colors">
                <TableCell>
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={client.photo} />
                    <AvatarFallback className="bg-secondary">{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    {client.name}
                    <p className="text-xs text-muted-foreground mt-0.5">{client.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.document}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{client.phone}</span>
                    <Badge variant="outline" className="w-fit text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                      WhatsApp Ativo
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {client.neighborhood}
                    <p className="text-xs text-muted-foreground">{client.city}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                      onClick={() => handleWhatsApp(client.whatsapp)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-primary/20">
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit2 className="w-4 h-4" /> Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-destructive cursor-pointer"
                          onSelect={() => handleDelete(client.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm 
            key={editingClient?.id || 'new'}
            onSuccess={() => setIsFormOpen(false)} 
            client={editingClient}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

