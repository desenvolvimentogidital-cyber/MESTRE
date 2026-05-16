
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, Download, FileText, TrendingUp, PieChart, ClipboardList, Users, Package } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import logoMestre from './logoMestre.png';

export function Relatorios() {
  const { transactions, clients, inventory, quotes, osList, services, materials, user } = useStore();

  const getReportData = (title: string) => {
    switch (title) {
      case 'Desempenho Financeiro':
        return transactions.map(t => ({
          ID: t.id.substring(0, 8).toUpperCase(),
          Data: format(new Date(t.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          Tipo: t.type === 'INCOME' ? 'Receita' : 'Despesa',
          Categoria: t.category,
          Descrição: t.description,
          Valor: t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          Status: t.isPaid ? 'Pago' : 'Pendente'
        }));
      case 'Serviços Prestados':
        return osList.map(os => {
          const client = clients.find(c => c.id === os.clientId);
          return {
            ID: os.id.substring(0, 8).toUpperCase(),
            Cliente: client?.name || 'Não informado',
            Status: os.status,
            Data: format(new Date(os.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
            Total: os.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          };
        });
      case 'Consumo de Materiais':
        return inventory.map(item => ({
          Código: item.code,
          Nome: item.name,
          Categoria: item.category,
          Quantidade: item.quantity,
          'Preço Custo': item.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          Fornecedor: item.supplier
        }));
      case 'Conversão de Orçamentos':
        return quotes.map(q => {
          const client = clients.find(c => c.id === q.clientId);
          return {
            ID: q.id.substring(0, 8).toUpperCase(),
            Cliente: client?.name || 'Não informado',
            Status: q.status,
            Data: format(new Date(q.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
            Total: q.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          };
        });
      case 'Distribuição de Clientes':
        return clients.map(c => ({
          Nome: c.name,
          Email: c.email,
          Telefone: c.phone,
          Bairro: c.neighborhood,
          Cidade: c.city,
          'Data Cadastro': format(new Date(c.createdAt || new Date()), 'dd/MM/yyyy', { locale: ptBR })
        }));
      case 'Ranking de Serviços':
        return services.map(s => ({
          Nome: s.name,
          Categoria: s.category,
          Preço: s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          Status: s.status
        }));
      default:
        return [];
    }
  };

  const generateReportHTML = (title: string, data: any[]) => {
    const now = format(new Date(), 'dd/MM/yyyy HH:mm');
    const headers = Object.keys(data[0]);
    
    // Calculate stats cards
    let stats = { total: data.length, approved: 0, pending: 0, rejected: 0 };
    
    if (title === 'Conversão de Orçamentos') {
      stats.approved = data.filter(d => d.Status === 'APROVADO').length;
      stats.pending = data.filter(d => d.Status === 'PENDENTE').length;
      stats.rejected = data.filter(d => d.Status === 'RECUSADO').length;
    } else if (title === 'Serviços Prestados') {
      stats.approved = data.filter(d => d.Status === 'Finalizada').length;
      stats.pending = data.filter(d => ['Aberta', 'Em Andamento'].includes(d.Status)).length;
      stats.rejected = data.filter(d => d.Status === 'Cancelada').length;
    } else if (title === 'Desempenho Financeiro') {
      stats.approved = data.filter(d => d.Tipo === 'Receita').length;
      stats.pending = data.filter(d => d.Status === 'Pendente').length;
      stats.rejected = data.filter(d => d.Tipo === 'Despesa').length;
    }

    const rowsHTML = data.map(row => `
      <tr>
        ${headers.map(header => {
          const value = row[header];
          let statusClass = '';
          if (header === 'Status') {
            if (['APROVADO', 'Finalizada', 'Receita', 'Pago'].includes(value)) statusClass = 'status-approved';
            else if (['PENDENTE', 'Aberta', 'Em Andamento', 'Pendente'].includes(value)) statusClass = 'status-pending';
            else if (['RECUSADO', 'Cancelada', 'Despesa'].includes(value)) statusClass = 'status-rejected';
          }
          
          return `<td>${header === 'Status' ? `<span class="status ${statusClass}">${value}</span>` : value}</td>`;
        }).join('')}
      </tr>
    `).join('');

    return `
      <div style="font-family: 'Poppins', sans-serif; background: #f4f6f9; padding: 40px; color: #333; width: 1100px;">
        <div style="max-width: 1100px; margin: auto; background: #fff; border-radius: 18px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
          <!-- HEADER ESCURO -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #111827; padding: 30px; border-radius: 14px; margin-bottom: 35px; border-bottom: 4px solid #ffc107;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img src="${logoMestre}" style="width: 110px; height: auto;" />
              <div style="margin-left: 10px;">
                <h1 style="font-size: 28px; font-weight: 700; color: #fff; margin: 0;">${user?.companyName || 'Mestre Elétrica'}</h1>
                <p style="color: #ffc107; font-weight: 500; font-size: 14px; margin-top: 2px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${title}</p>
              </div>
            </div>
            <div style="text-align: right; color: #fff;">
              <h3 style="font-size: 12px; color: #94a3b8; margin-bottom: 4px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Gerado em</h3>
              <p style="font-size: 15px; font-weight: 600; margin: 0;">${now}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 35px;">
            <div style="padding: 22px; border-radius: 16px; color: #fff; background: #111827;">
              <h2 style="font-size: 14px; font-weight: 500; opacity: .9; margin: 0;">Total</h2>
              <h1 style="font-size: 30px; margin-top: 10px; margin-bottom: 0;">${stats.total}</h1>
            </div>
            <div style="padding: 22px; border-radius: 16px; color: #fff; background: #16a34a;">
              <h2 style="font-size: 14px; font-weight: 500; opacity: .9; margin: 0;">Aprovados / Receitas</h2>
              <h1 style="font-size: 30px; margin-top: 10px; margin-bottom: 0;">${stats.approved}</h1>
            </div>
            <div style="padding: 22px; border-radius: 16px; color: #fff; background: #f59e0b;">
              <h2 style="font-size: 14px; font-weight: 500; opacity: .9; margin: 0;">Pendentes</h2>
              <h1 style="font-size: 30px; margin-top: 10px; margin-bottom: 0;">${stats.pending}</h1>
            </div>
            <div style="padding: 22px; border-radius: 16px; color: #fff; background: #dc2626;">
              <h2 style="font-size: 14px; font-weight: 500; opacity: .9; margin: 0;">Recusados / Despesas</h2>
              <h1 style="font-size: 30px; margin-top: 10px; margin-bottom: 0;">${stats.rejected}</h1>
            </div>
          </div>

          <div style="margin-top: 10px;">
            <div style="font-size: 22px; font-weight: 600; margin-bottom: 18px;">Dados do Relatório</div>
            <table style="width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 14px;">
              <thead style="background: #ffc107;">
                <tr>
                  ${headers.map(h => `<th style="padding: 16px; text-align: left; font-size: 14px; color: #111;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; color: #888; font-size: 13px;">
            <div>Sistema Mestre Elétrica</div>
            <div>Página 1</div>
          </div>
        </div>
        <style>
          .status { padding: 8px 14px; border-radius: 30px; font-size: 12px; font-weight: 600; display: inline-block; }
          .status-approved { background: #dcfce7; color: #15803d; }
          .status-pending { background: #fef3c7; color: #b45309; }
          .status-rejected { background: #fee2e2; color: #b91c1c; }
          td { padding: 16px; font-size: 14px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      </div>
    `;
  };

  const handleDownloadPDF = async (title: string) => {
    const loadingToast = toast.loading(`Gerando relatório ${title}...`);
    try {
      const data = getReportData(title);
      if (data.length === 0) {
        toast.dismiss(loadingToast);
        toast.error('Não há dados suficientes para gerar este relatório.');
        return;
      }

      const html = generateReportHTML(title, data);
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.innerHTML = html;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f4f6f9'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Relatorio_${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);

      document.body.removeChild(container);
      toast.dismiss(loadingToast);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao gerar PDF.');
    }
  };

  const handleDownloadExcel = (title: string) => {
    try {
      const data = getReportData(title);
      if (data.length === 0) {
        toast.error('Não há dados suficientes para gerar este relatório.');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
      
      XLSX.writeFile(workbook, `Relatorio_${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('Excel baixado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar Excel.');
    }
  };

  const reports = [
    { title: 'Desempenho Financeiro', icon: TrendingUp, desc: 'Entradas, saídas e lucro líquido por período.' },
    { title: 'Serviços Prestados', icon: ClipboardList, desc: 'Quantidade de OS finalizadas e faturamento.' },
    { title: 'Consumo de Materiais', icon: Package, desc: 'Itens mais utilizados e custo de reposição.' },
    { title: 'Conversão de Orçamentos', icon: FileText, desc: 'Taxa de aprovação de orçamentos enviados.' },
    { title: 'Distribuição de Clientes', icon: Users, desc: 'Bairros com maior demanda e tipos de clientes.' },
    { title: 'Ranking de Serviços', icon: BarChart3, desc: 'Quais tipos de serviços geram mais receita.' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Analise os números do seu negócio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {reports.map((rel, i) => (
           <Card key={i} className="bg-card border-border rounded-2xl hover:border-primary/40 transition-all group shadow-sm hover:shadow-primary/5">
             <CardHeader>
                <div className="bg-secondary w-10 h-10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                   <rel.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{rel.title}</CardTitle>
                <p className="text-sm text-zinc-500 pt-1">{rel.desc}</p>
             </CardHeader>
             <CardContent>
                <div className="flex gap-2">
                   <Button onClick={() => handleDownloadPDF(rel.title)} size="sm" variant="outline" className="flex-1 gap-2 text-xs">
                      <Download className="w-3 h-3" /> PDF
                   </Button>
                   <Button onClick={() => handleDownloadExcel(rel.title)} size="sm" variant="outline" className="flex-1 gap-2 text-xs">
                      <FileText className="w-3 h-3" /> Excel
                   </Button>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
