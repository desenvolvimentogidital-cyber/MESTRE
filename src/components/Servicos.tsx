
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search, 
  Plus, 
  Zap, 
  Clock, 
  DollarSign, 
  Trash2, 
  Edit2,
  Wrench
} from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ServiceForm } from './forms/ServiceForm';

export function Servicos() {
  const { services, deleteService } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(undefined);

  const handleNewService = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = (id: string) => {
    toast.warning('Deseja excluir este serviço?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteService(id);
          toast.success('Serviço excluído!');
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo de Serviços</h2>
          <p className="text-muted-foreground">Padronize seus preços e tempos de execução.</p>
        </div>
        <Button onClick={handleNewService} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Cadastrar Serviço
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card border-border rounded-2xl p-4">
           <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                 <Wrench className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] uppercase text-muted-foreground font-bold">Total Serviços</p>
                 <p className="text-xl font-bold">{services.length}</p>
              </div>
           </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
             placeholder="Buscar serviço..." 
             className="pl-10 bg-card border-border" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((service) => (
          <Card key={service.id} className="bg-card border-border rounded-2xl group hover:border-primary/40 transition-all shadow-sm">
            <CardHeader className="pb-2">
               <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                     {service.category}
                  </Badge>
                  <div className="flex gap-2">
                     <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditService(service);
                        }}
                     >
                        <Edit2 className="w-3.5 h-3.5" />
                     </Button>
                     <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors border border-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service.id);
                        }}
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </Button>
                  </div>
               </div>
               <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{service.name}</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <DollarSign className="w-4 h-4 text-primary" />
                        R$ {service.price.toFixed(2)}
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {editingService ? 'Editar Serviço' : 'Novo Serviço Padrão'}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm 
            onSuccess={() => setIsFormOpen(false)} 
            service={editingService}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
