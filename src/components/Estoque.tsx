
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
import { Badge } from './ui/badge';
import { Package, AlertTriangle, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { InventoryForm } from './forms/InventoryForm';
import { VoiceInput } from './VoiceInput';
import { InventoryItem } from '../types';

export function Estoque() {
  const { inventory, deleteInventoryItem } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewItem = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toast.warning('Deseja excluir este item do estoque?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteInventoryItem(id);
          toast.success('Item excluído com sucesso!');
        },
      },
      duration: 5000,
    });
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estoque</h2>
          <p className="text-muted-foreground">Controle de materiais e ferramentas.</p>
        </div>
        <Button onClick={handleNewItem} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          NOVO ITEM
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="pt-6">
             <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                   <Package className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Total de Itens</p>
                   <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
             </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-yellow-500/20 rounded-2xl">
          <CardContent className="pt-6">
             <div className="flex items-center gap-4">
                <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                   <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                   <p className="text-2xl font-bold">{inventory.filter(i => i.quantity <= i.minQuantity).length}</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar material..." 
          className="pl-10 pr-10 bg-card" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 scale-75">
          <VoiceInput onTranscript={(text) => setSearchTerm(text)} />
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cód.</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Qtd. Atual</TableHead>
              <TableHead>Vlr. Venda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id} className="group cursor-pointer hover:bg-secondary/20" onClick={() => handleEditItem(item)}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.code}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {item.name}
                    <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>R$ {item.salePrice.toFixed(2)}</TableCell>
                <TableCell>
                   <Badge variant={item.quantity > item.minQuantity ? 'default' : 'destructive'} 
                          className={item.quantity > item.minQuantity ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}>
                     {item.quantity > item.minQuantity ? 'Em Estoque' : 'Crítico'}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-all border border-destructive/20"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredInventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum item encontrado.
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
              <Package className="w-5 h-5 text-primary" />
              {editingItem ? 'Editar Item' : 'Novo Item de Estoque'}
            </DialogTitle>
          </DialogHeader>
          <InventoryForm 
            onSuccess={() => setIsFormOpen(false)} 
            item={editingItem}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

