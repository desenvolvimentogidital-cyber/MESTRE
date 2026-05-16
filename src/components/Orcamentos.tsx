
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Search, FileText, Download, Share2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { QuoteForm } from './forms/QuoteForm';
import { Quote } from '../types';
import { toast } from 'sonner';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusMap = {
  'PENDING': { label: 'Pendente', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  'APPROVED': { label: 'Aprovado', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
  'REJECTED': { label: 'Rejeitado', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  'ANALYSIS': { label: 'Em Análise', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
};

export function Orcamentos() {
  const { quotes, clients, deleteQuote, addQuote, updateQuote, addOS, user } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Desconhecido';

  const filteredQuotes = quotes.filter(q => {
    const clientName = getClientName(q.clientId).toLowerCase();
    const quoteId = q.id.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase()) || quoteId.includes(searchTerm.toLowerCase());
  });

  const handleNewEstimate = () => {
    setEditingQuote(undefined);
    setIsFormOpen(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setIsFormOpen(true);
  };

  const handleDownload = (quote: Quote) => {
    try {
      const doc = new jsPDF() as any;
      const client = clients.find(c => c.id === quote.clientId);
  
      // --- HEADER ---
      // Dark header background
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 50, 'F');
      
      // Secondary color bar (yellow)
      doc.setFillColor(250, 204, 21);
      doc.rect(0, 48, 210, 2, 'F');

      // Logo/Brand
      const displayName = user?.companyName || user?.name || "ORÇAMENTO";
      
      if (user?.companyLogo) {
        try {
          doc.addImage(user.companyLogo, 'PNG', 15, 10, 35, 35, undefined, 'FAST');
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
      doc.text("ORÇAMENTO", 140, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`Nº: ORC-${quote.id.toUpperCase().slice(0, 6)}`, 140, 28);
      doc.text(`Data: ${new Date(quote.date).toLocaleDateString('pt-BR')}`, 140, 34);
  
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
      doc.text(`Endereço:`, 20, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`${client?.address || 'Não informado'}`, 45, 100);

      doc.setFont("helvetica", "bold");
      doc.text(`E-mail:`, 20, 107);
      doc.setFont("helvetica", "normal");
      doc.text(`${client?.email || 'Não informado'}`, 45, 107);

      // Section Title: Itens
      doc.setFillColor(250, 204, 21);
      doc.rect(15, 125, 2, 8, 'F');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.text("Itens do Orçamento", 22, 132);
  
      // Items Table
      const tableData = quote.items.map(item => [
        item.description,
        item.quantity,
        item.type === 'service' ? 'Serviço' : 'Material',
        `R$ ${item.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);
  
      autoTable(doc, {
        startY: 140,
        head: [['Descrição', 'Qtd', 'Tipo', 'Unitário', 'Total']],
        body: tableData,
        headStyles: { fillColor: [17, 24, 39], fontSize: 10, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 15, right: 15 }
      });
  
      // Total Box
      let finalY = (doc as any).lastAutoTable?.finalY || 180;
      doc.setFillColor(17, 24, 39);
      doc.roundedRect(15, finalY + 10, 180, 25, 4, 4, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("VALOR TOTAL", 25, finalY + 26);
      
      doc.setTextColor(250, 204, 21);
      doc.setFontSize(24);
      doc.text(`R$ ${quote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY + 27, { align: 'right' });

      // Valid Badge
      doc.setFillColor(250, 204, 21);
      doc.roundedRect(15, finalY + 45, 60, 10, 5, 5, 'F');
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      doc.text(`Orçamento válido por ${quote.validity || '7'} dias`, 19, finalY + 51.5);

      // Observations
      const obsText = quote.description || user?.quoteTerms || "";
      const obsLines = doc.splitTextToSize(obsText, 170);
      const obsHeight = (obsLines.length * 5) + 18;

      const boxY = finalY + 65;
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(15, boxY, 180, obsHeight, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.text("Observações", 22, boxY + 10);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      doc.text(obsLines, 22, boxY + 18);

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(229, 231, 235);
      doc.line(15, pageHeight - 40, 195, pageHeight - 40);
      
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Contatos:", 15, pageHeight - 30);
      doc.setFont("helvetica", "normal");
      doc.text(`WhatsApp: ${user?.phone || '(11) 99999-9999'}`, 15, pageHeight - 25);
      doc.text(`Email: ${user?.emailContact || ''}`, 15, pageHeight - 20);
      doc.text(`Instagram: ${user?.instagram || ''}`, 15, pageHeight - 15);
      
      doc.setDrawColor(17, 24, 39);
      doc.line(130, pageHeight - 25, 195, pageHeight - 25);
      doc.text("Responsável Técnico", 143, pageHeight - 20);
  
      doc.save(`orcamento_${quote.id}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleShare = () => {
    toast.success('Link do orçamento copiado para o WhatsApp!');
  };

  const handleDeleteQuote = (id: string) => {
    toast.warning('Deseja excluir este orçamento?', {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteQuote(id);
          toast.success('Orçamento excluído com sucesso!');
        },
      },
      duration: 5000,
    });
  };

  const handleDuplicateQuote = (quote: Quote) => {
    const newQuote = {
      ...quote,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    addQuote(newQuote);
    toast.success('Orçamento duplicado!');
  };

  const handleApproveAndGenerateOS = (quote: Quote) => {
    // Update quote status
    updateQuote({
      ...quote,
      status: 'APPROVED'
    });

    const newOS = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: quote.clientId,
      responsibleId: '1', // Default to admin
      description: `Execução de: ${quote.items.map(i => i.description).join(', ')}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:00',
      status: 'SCHEDULED' as any,
      location: clients.find(c => c.id === quote.clientId)?.address || '',
      items: quote.items,
      sharedWith: [],
      usedMaterials: [],
      technicalNotes: '',
      checklist: [],
      images: [],
      photosBefore: [],
      photosAfter: [],
      totalValue: quote.totalValue,
      createdAt: new Date().toISOString(),
    };
    addOS(newOS);
    toast.success('Orçamento aprovado! OS Gerada com sucesso.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">Crie e envie orçamentos profissionais.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleNewEstimate} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
             <Plus className="w-4 h-4" />
             NOVO ORÇAMENTO
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cliente ou ID..." 
            className="pl-10 bg-card" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                       <FileText className="w-12 h-12 opacity-20" />
                       <p>Nenhum orçamento encontrado.</p>
                       <Button variant="link" onClick={handleNewEstimate} className="text-primary">Comece criando o primeiro</Button>
                    </div>
                 </TableCell>
               </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-mono text-xs">#{quote.id.slice(0, 5)}</TableCell>
                  <TableCell className="font-medium">{getClientName(quote.clientId)}</TableCell>
                  <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold text-primary">R$ {quote.totalValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusMap[quote.status || 'PENDING'].color}>
                      {statusMap[quote.status || 'PENDING'].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                        <Button onClick={() => handleDownload(quote)} variant="ghost" size="icon" className="hover:text-primary">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleShare} variant="ghost" size="icon" className="hover:text-green-500">
                          <Share2 className="w-4 h-4" />
                        </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                             <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                               <Edit2 className="w-4 h-4 mr-2" /> Editar
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDuplicateQuote(quote)}>Duplicar</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleApproveAndGenerateOS(quote)} className="text-green-500 font-bold">Aprovar e Gerar OS</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-destructive">
                               <Trash2 className="w-4 h-4 mr-2" /> Excluir
                             </DropdownMenuItem>
                           </DropdownMenuContent>


                        </DropdownMenu>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl bg-card border-primary/20 p-0 overflow-hidden">
          <div className="p-6 bg-secondary/30 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {editingQuote ? 'Editar Orçamento' : 'Novo Orçamento Profissional'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <QuoteForm 
              onSuccess={() => setIsFormOpen(false)} 
              quote={editingQuote}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

