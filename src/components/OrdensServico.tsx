
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ClipboardList, Plus, Search, Calendar, Clock, MapPin, Edit2, Trash2, CheckCircle2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SignaturePad } from './SignaturePad';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { OSForm } from './forms/OSForm';
import { OS } from '../types';
import { ChatInterno } from './ChatInterno';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function OrdensServico() {
  const { osList, clients, deleteOS, updateOS, user, settings } = useStore();
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OS | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatOS, setActiveChatOS] = useState<OS | null>(null);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente';

  const handleDownload = (os: OS) => {
    try {
      const doc = new jsPDF() as any;
      const client = clients.find(c => c.id === os.clientId);
  
      // --- HEADER ---
      // Dark header background
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 50, 'F');
      
      // Secondary color bar (yellow)
      doc.setFillColor(250, 204, 21);
      doc.rect(0, 48, 210, 2, 'F');

      // Logo/Brand
      const displayName = user?.companyName || user?.name || "ORDEM DE SERVIÇO";

      if (user?.companyLogo) {
        try {
          const logoX = settings?.logoX || 15;
          const logoY = settings?.logoY || 10;
          const logoW = settings?.logoWidth || 35;
          const logoH = settings?.logoHeight || 35;
          doc.addImage(user.companyLogo, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
        } catch (e) {
          console.error("Erro ao adicionar logo ao PDF", e);
          doc.setFontSize(30);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text(displayName.toUpperCase(), 15, 25);
        }
      } else {
        doc.setFontSize(30);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(displayName.toUpperCase(), 15, 25);
      }
      
      if (user?.companyName) {
        doc.setFontSize(10);
        doc.setTextColor(250, 204, 21);
        doc.setFont("helvetica", "normal");
        doc.text(user.companyName, user.companyLogo ? 55 : 15, 33);
      }
  
      // Info Top Right
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("ORDEM DE SERVIÇO", 125, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`Nº: OS-${os.id.toUpperCase().slice(-6)}`, 125, 28);
      doc.text(`Data: ${new Date(os.scheduledDate).toLocaleDateString('pt-BR')}`, 125, 34);
      doc.text(`Status: ${os.status}`, 125, 40);
  
      // --- CONTENT ---
      
      // Section Title: Dados do Cliente
      doc.setFillColor(250, 204, 21);
      doc.rect(15, 65, 2, 8, 'F');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.text("Dados do Cliente", 22, 72);

      // Client Box
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(15, 78, 180, 35, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(`Cliente:`, 20, 86);
      doc.setFont("helvetica", "normal");
      doc.text(`${client?.name || 'Não informado'}`, 45, 86);

      doc.setFont("helvetica", "bold");
      doc.text(`Telefone:`, 20, 93);
      doc.setFont("helvetica", "normal");
      doc.text(`${client?.phone || 'Não informado'}`, 45, 93);

      doc.setFont("helvetica", "bold");
      doc.text(`Localização:`, 20, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`${os.location || client?.address || 'Não informado'}`, 45, 100);

      doc.setFont("helvetica", "bold");
      doc.text(`E-mail:`, 20, 107);
      doc.setFont("helvetica", "normal");
      doc.text(`${client?.email || 'Não informado'}`, 45, 107);

      // Section Title: Descrição
      doc.setFillColor(250, 204, 21);
      doc.rect(15, 125, 2, 8, 'F');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.text("Descrição do Serviço", 22, 132);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      const descLines = doc.splitTextToSize(os.description, 170);
      doc.text(descLines, 22, 142);
  
      // Table Header Spacer
      const descHeight = (descLines.length * 5) + 5;
      const tableStartY = 142 + descHeight;

      // Section Title: Itens
      doc.setFillColor(250, 204, 21);
      doc.rect(15, tableStartY, 2, 8, 'F');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.text("Itens/Produtos Utilizados", 22, tableStartY + 7);
  
      const isAdmin = user?.role === 'admin';
  
      const tableData = os.items.map(item => {
        const row = [item.description, item.quantity];
        if (isAdmin) {
          row.push(`R$ ${item.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
          row.push(`R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        }
        return row;
      });
  
      autoTable(doc, {
        startY: tableStartY + 15,
        head: [isAdmin ? ['Item/Serviço', 'Qtd', 'Unitário', 'Total'] : ['Item/Serviço', 'Qtd']],
        body: tableData,
        headStyles: { fillColor: [17, 24, 39], fontSize: 10, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 15, right: 15 }
      });
  
      // Total Box (only for admin)
      if (isAdmin) {
        const finalY = (doc as any).lastAutoTable?.finalY || 200;
        doc.setFillColor(17, 24, 39);
        doc.roundedRect(120, finalY + 10, 75, 20, 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL", 125, finalY + 22);
        
        doc.setTextColor(250, 204, 21);
        doc.setFontSize(16);
        doc.text(`R$ ${os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY + 23, { align: 'right' });
      }
  
      // Footer / Signature
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(user?.osTerms || "Este documento é uma Ordem de Serviço eletrônica.", 15, pageHeight - 45);
      
      doc.setFontSize(8);
      doc.setTextColor(31, 41, 55);
      doc.text(`Contato: ${user?.phone || ''} | Instagram: @${user?.instagram || ''}`, 15, pageHeight - 38);
      
      const addrLinesOS = doc.splitTextToSize(`Endereço: ${user?.address || ''}`, 100);
      doc.text(addrLinesOS, 15, pageHeight - 34);

      doc.setDrawColor(17, 24, 39);
      doc.line(125, pageHeight - 30, 195, pageHeight - 30);
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      doc.text("Assinatura do Cliente", 145, pageHeight - 25);
  
      doc.save(`os_${os.id}.pdf`);
      toast.success('PDF da OS gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF da OS');
    }
  };

  const filteredOS = osList.filter(os => {
    const clientName = getClientName(os.clientId).toLowerCase();
    const desc = os.description.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
  });

  const handleNewOS = () => {
    setEditingOS(undefined);
    setIsFormOpen(true);
  };

  const handleEditOS = (os: OS) => {
    setEditingOS(os);
    setIsFormOpen(true);
  };

  const handleDeleteOS = (id: string) => {
    toast.warning('Deseja realmente excluir esta OS?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteOS(id);
          toast.success('OS excluída!');
        },
      },
      duration: 5000,
    });
  };

  const handleStatusChange = (os: OS, newStatus: string) => {
    updateOS({ ...os, status: newStatus as any });
    toast.success(`Status atualizado para: ${newStatus}`);
  };

  const statusColors = {
    'SCHEDULED': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'IN_PROGRESS': 'bg-primary/20 text-primary border-primary/30',
    'FINISHED': 'bg-green-500/20 text-green-500 border-green-500/30',
    'CANCELLED': 'bg-red-500/20 text-red-500 border-red-500/30',
    'WAITING_MATERIAL': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie a execução dos seus serviços.</p>
        </div>
        <Button onClick={handleNewOS} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          NOVA OS
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cliente ou técnico..." 
            className="pl-10 bg-card" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {filteredOS.length === 0 ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground bg-card border border-primary/10 rounded-2xl gap-2">
               <ClipboardList className="w-12 h-12 opacity-10" />
               <p>Nenhuma ordem de serviço encontrada.</p>
               <Button variant="link" onClick={handleNewOS} className="text-primary font-bold">Criar Primeira OS</Button>
            </div>
         ) : (
           filteredOS.map((os) => (
            <Card key={os.id} className="bg-card border-primary/10 hover:border-primary/40 transition-all group">
              <CardHeader className="pb-2">
                 <div className="flex justify-between items-start">
                    <Badge className={statusColors[os.status] || statusColors['SCHEDULED']}>{os.status}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">#{os.id.slice(-4)}</span>
                 </div>
                 <CardTitle className="mt-2 text-lg truncate">{os.description}</CardTitle>
                 <p className="text-sm text-muted-foreground">Cliente: {getClientName(os.clientId)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Calendar className="w-4 h-4 text-primary" />
                       <span>{new Date(os.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Clock className="w-4 h-4 text-primary" />
                       <span>{os.scheduledTime}</span>
                    </div>
                    {os.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <MapPin className="w-4 h-4 text-primary" />
                         <span>{os.location}</span>
                      </div>
                    )}
                 </div>
                 
                 <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" className="text-xs hover:text-primary transition-colors" onClick={() => setActiveChatOS(os)}>Chat</Button>
                       <Button variant="ghost" size="sm" className="text-xs hover:text-primary transition-colors" onClick={() => handleDownload(os)}>
                         <Download className="w-3 h-3 mr-1" /> PDF
                       </Button>
                       <Button variant="ghost" size="sm" className="text-xs hover:text-primary transition-colors" onClick={() => setSignatureOpen(true)}>Assinar</Button>
                       <Button variant="ghost" size="sm" className="text-xs hover:text-primary transition-colors" onClick={() => handleEditOS(os)}>
                         <Edit2 className="w-3 h-3 mr-1" /> Editar
                       </Button>
                    </div>
                    <div className="flex gap-1">
                       {os.status !== 'FINISHED' && (
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 text-green-500 hover:bg-green-500/10"
                           onClick={() => handleStatusChange(os, 'FINISHED')}
                           title="Finalizar"
                         >
                           <CheckCircle2 className="w-4 h-4" />
                         </Button>
                       )}
                       {user?.role === 'admin' && (
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteOS(os.id)}
                            title="Excluir"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                    </div>
                 </div>
              </CardContent>
            </Card>
           ))
         )}
      </div>

      <SignaturePad 
        open={signatureOpen} 
        onClose={() => setSignatureOpen(false)} 
        onSave={(sig) => console.log('Assinatura salva:', sig)} 
      />

      <Dialog open={!!activeChatOS} onOpenChange={() => setActiveChatOS(null)}>
        <DialogContent className="max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Chat da Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {activeChatOS && <ChatInterno os={activeChatOS} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {editingOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </DialogTitle>
          </DialogHeader>
          <OSForm 
            onSuccess={() => setIsFormOpen(false)} 
            os={editingOS}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
