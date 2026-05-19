
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search, 
  Plus, 
  Package, 
  Tag, 
  DollarSign, 
  Trash2, 
  Edit2,
  Boxes
} from 'lucide-react';
import { Badge } from './ui/badge';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { MaterialForm } from './forms/MaterialForm';
import { VoiceInput } from './VoiceInput';

export function Materiais() {
  const { materials, deleteMaterial } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(undefined);

  const handleNewMaterial = () => {
    setEditingMaterial(undefined);
    setIsFormOpen(true);
  };

  const handleEditMaterial = (material: any) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDeleteMaterial = (id: string) => {
    toast.warning('Deseja excluir este material?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteMaterial(id);
          toast.success('Material excluído!');
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogo de Materiais</h2>
          <p className="text-muted-foreground">Gerencie os preços dos seus materiais principais.</p>
        </div>
        <Button onClick={handleNewMaterial} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Cadastrar Material
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card border-border rounded-2xl p-4">
           <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                 <Package className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] uppercase text-muted-foreground font-bold">Total Materiais</p>
                 <p className="text-xl font-bold">{materials.length}</p>
              </div>
           </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
             placeholder="Buscar material..." 
             className="pl-10 pr-10 bg-card border-border" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 scale-75">
            <VoiceInput onTranscript={(text) => setSearchTerm(text)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((material) => (
          <Card key={material.id} className="bg-card border-border rounded-2xl group hover:border-primary/40 transition-all shadow-sm">
            <CardHeader className="pb-2">
               <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px]">
                     {material.category}
                  </Badge>
                  <div className="flex gap-2">
                     <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMaterial(material);
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
                          handleDeleteMaterial(material.id);
                        }}
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </Button>
                  </div>
               </div>
               <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{material.name}</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <DollarSign className="w-4 h-4 text-primary" />
                        R$ {material.price.toFixed(2)} / {material.unit}
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
              <Package className="w-5 h-5 text-primary" />
              {editingMaterial ? 'Editar Material' : 'Novo Material'}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm 
            onSuccess={() => setIsFormOpen(false)} 
            material={editingMaterial}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
