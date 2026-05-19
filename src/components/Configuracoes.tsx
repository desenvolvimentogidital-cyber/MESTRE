
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Settings, User as UserIcon, Building2, Bell, Shield, Palette, Database, Smartphone, Upload, Trash2, CheckCircle2, Users, Plus, Loader2, TrendingUp, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { VoiceInput } from './VoiceInput';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function Configuracoes() {
  const { user, setUser, team, addTeamMember, updateTeamMember, deleteTeamMember, settings, updateSettings } = useStore();
  const [logo, setLogo] = useState<string | null>(user?.companyLogo || null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        if (user) {
          setUser({ ...user, companyLogo: base64 });
        }
        toast.success('Logo carregada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (user) {
          setUser({ ...user, avatar: base64 });
        }
        toast.success('Foto de perfil atualizada!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user || !auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name: user.name || '',
        avatar: user.avatar || '',
        companyName: user.companyName || '',
        phone: user.phone || '',
        instagram: user.instagram || '',
        emailContact: user.emailContact || '',
        address: user.address || '',
        quoteTerms: user.quoteTerms || '',
        osTerms: user.osTerms || '',
        companyLogo: user.companyLogo || ''
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    if (user) {
      setUser({ ...user, companyLogo: undefined });
    }
    toast.info('Logo removida.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Personalize o sistema para o seu negócio.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground font-bold flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar Tudo'}
        </Button>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="empresa" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Empresa</TabsTrigger>
          <TabsTrigger value="custos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Custos</TabsTrigger>
          <TabsTrigger value="perfil" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Perfil</TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sistema</TabsTrigger>
          <TabsTrigger value="equipe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                  <Building2 className="w-4 h-4" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>Informações que aparecerão em seus documentos e orçamentos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Nome da Empresa</Label>
                      <VoiceInput onTranscript={(text) => user && setUser({...user, companyName: (user.companyName ? user.companyName + ' ' : '') + text})} />
                    </div>
                    <Input 
                      value={user?.companyName || ''} 
                      onChange={(e) => user && setUser({...user, companyName: e.target.value})}
                      className="bg-secondary/20" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp / Telefone</Label>
                      <Input 
                        value={user?.phone || ''} 
                        onChange={(e) => user && setUser({...user, phone: e.target.value})}
                        className="bg-secondary/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input 
                        value={user?.instagram || ''} 
                        onChange={(e) => user && setUser({...user, instagram: e.target.value})}
                        className="bg-secondary/20" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email de Contato</Label>
                    <Input 
                      value={user?.emailContact || ''} 
                      onChange={(e) => user && setUser({...user, emailContact: e.target.value})}
                      className="bg-secondary/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Endereço Completo</Label>
                      <VoiceInput onTranscript={(text) => user && setUser({...user, address: (user.address ? user.address + ' ' : '') + text})} />
                    </div>
                    <Input 
                      value={user?.address || ''} 
                      onChange={(e) => user && setUser({...user, address: e.target.value})}
                      className="bg-secondary/20" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                  <Database className="w-4 h-4" />
                  Termos e Observações (PDF)
                </CardTitle>
                <CardDescription>Textos padrão que aparecem no final dos seus documentos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Observações do Orçamento</Label>
                      <VoiceInput onTranscript={(text) => user && setUser({...user, quoteTerms: (user.quoteTerms ? user.quoteTerms + ' ' : '') + text})} />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-md bg-secondary/20 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user?.quoteTerms || ''}
                      onChange={(e) => user && setUser({...user, quoteTerms: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Rodapé da Ordem de Serviço</Label>
                      <VoiceInput onTranscript={(text) => user && setUser({...user, osTerms: (user.osTerms ? user.osTerms + ' ' : '') + text})} />
                    </div>
                    <textarea 
                      className="w-full min-h-[80px] p-3 rounded-md bg-secondary/20 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user?.osTerms || ''}
                      onChange={(e) => user && setUser({...user, osTerms: e.target.value})}
                    />
                 </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                  <Palette className="w-4 h-4" />
                  Logo para PDF e Orçamentos
                </CardTitle>
                <CardDescription>Esta imagem será usada no cabeçalho de todos os seus arquivos gerados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  {logo ? (
                    <div className="relative group">
                      <img src={logo} alt="Preview" className="max-h-40 max-w-full rounded-lg shadow-lg" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-3">
                         <Button size="icon" variant="destructive" onClick={handleRemoveLogo}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                         <Label htmlFor="logo-upload" className="bg-primary text-primary-foreground p-2 rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                            <Upload className="w-4 h-4" />
                         </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold">Arraste sua logo aqui</p>
                        <p className="text-xs text-muted-foreground">PNG ou JPG (Máx. 2MB)</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                         Selecionar Arquivo
                      </Button>
                    </div>
                  )}
                  <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custos" className="space-y-6">
           <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                  <TrendingUp className="w-4 h-4" />
                  Cálculo de Custos e Hora Técnica
                </CardTitle>
                <CardDescription>Gerencie seus gastos mensais e calcule o valor ideal da sua hora de serviço.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <Label className="font-bold">Custos Mensais (Func., Combustível, Aluguel, etc.)</Label>
                       <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const currentCosts = settings?.monthlyCosts || [];
                          const newCosts = [...currentCosts, { id: Math.random().toString(36).substr(2, 9), name: '', value: 0 }];
                          updateSettings({ monthlyCosts: newCosts });
                        }} 
                        className="h-7 text-[10px] font-bold gap-1"
                       >
                          <Plus className="w-3 h-3" /> Adicionar Custo
                       </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                       {(settings?.monthlyCosts || []).map((cost) => (
                         <div key={cost.id} className="flex items-center gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
                           <div className="relative flex-1">
                             <Input 
                               value={cost.name}
                               onChange={(e) => {
                                 const newCosts = (settings?.monthlyCosts || []).map(c => c.id === cost.id ? { ...c, name: e.target.value } : c);
                                 updateSettings({ monthlyCosts: newCosts });
                               }}
                               placeholder="Ex: Combustível"
                               className="bg-secondary/20 h-9 pr-10"
                             />
                             <div className="absolute right-1 top-1/2 -translate-y-1/2">
                               <VoiceInput onTranscript={(text) => {
                                 const newCosts = (settings?.monthlyCosts || []).map(c => c.id === cost.id ? { ...c, name: (c.name ? c.name + ' ' : '') + text } : c);
                                 updateSettings({ monthlyCosts: newCosts });
                               }} />
                             </div>
                           </div>
                           <div className="relative w-32 shrink-0">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">R$</span>
                             <Input 
                               type="number"
                               value={cost.value === 0 ? '' : cost.value}
                               onChange={(e) => {
                                 const newCosts = (settings?.monthlyCosts || []).map(c => c.id === cost.id ? { ...c, value: Number(e.target.value) } : c);
                                 updateSettings({ monthlyCosts: newCosts });
                               }}
                               className="bg-secondary/20 h-9 pl-8"
                             />
                           </div>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              const newCosts = (settings?.monthlyCosts || []).filter(c => c.id !== cost.id);
                              updateSettings({ monthlyCosts: newCosts });
                            }} 
                            className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       ))}
                       
                       {(settings?.monthlyCosts || []).length === 0 && (
                          <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-secondary/5">
                             <TrendingUp className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                             <p className="text-xs text-muted-foreground italic">Nenhum custo listado. Adicione seus gastos para calcular sua hora.</p>
                          </div>
                       )}
                    </div>
                  </div>

                  <div className="space-y-6 bg-secondary/10 p-6 rounded-2xl border border-border flex flex-col justify-between">
                     <div>
                        <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-4">
                           <Settings className="w-4 h-4" /> Resumo do Cálculo
                        </h4>
                        
                        <div className="space-y-4">
                           <div className="space-y-4 pt-6 border-t border-border">
                       <h4 className="text-sm font-bold flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          Ajuste do Logo (PDF)
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                             <Label className="text-xs">Largura (mm)</Label>
                             <Input 
                                type="number"
                                value={settings?.logoWidth || 35} 
                                onChange={(e) => updateSettings({ logoWidth: Number(e.target.value) })} 
                                className="bg-card h-8 border-primary/20"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs">Altura (mm)</Label>
                             <Input 
                                type="number"
                                value={settings?.logoHeight || 25} 
                                onChange={(e) => updateSettings({ logoHeight: Number(e.target.value) })} 
                                className="bg-card h-8 border-primary/20"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs">Posição X (mm)</Label>
                             <Input 
                                type="number"
                                value={settings?.logoX || 15} 
                                onChange={(e) => updateSettings({ logoX: Number(e.target.value) })} 
                                className="bg-card h-8 border-primary/20"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs">Posição Y (mm)</Label>
                             <Input 
                                type="number"
                                value={settings?.logoY || 15} 
                                onChange={(e) => updateSettings({ logoY: Number(e.target.value) })} 
                                className="bg-card h-8 border-primary/20"
                             />
                          </div>
                       </div>
                       <p className="text-[10px] text-muted-foreground italic">
                         * Os valores são em milímetros (mm). O padrão é: Largura=35, Altura=25, X=15, Y=15.
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <Label>Horas Úteis / Mês</Label>
                               <Input 
                                 type="number"
                                 value={settings?.billableHoursPerMonth === 0 ? '' : (settings?.billableHoursPerMonth || 160)}
                                 onChange={(e) => updateSettings({ billableHoursPerMonth: Number(e.target.value) })}
                                 className="bg-card h-10 font-bold"
                               />
                             </div>
                             <div className="space-y-2">
                               <Label>Margem Lucro Prestador (%)</Label>
                               <Input 
                                 type="number"
                                 value={settings?.serviceMargin === 0 ? '' : (settings?.serviceMargin || 0)}
                                 onChange={(e) => updateSettings({ serviceMargin: Number(e.target.value) })}
                                 className="bg-card h-10 font-bold"
                               />
                             </div>
                           </div>
                           <p className="text-[10px] text-muted-foreground">Horas cobráveis e margem desejada sobre o custo fixo.</p>
                           
                           <div className="p-5 bg-background border border-border rounded-xl space-y-3 shadow-sm">
                              <div className="flex justify-between items-center text-xs text-muted-foreground font-bold">
                                 <span>CUSTO FIXO POR HORA:</span>
                                 <span className="text-foreground">R$ {((settings?.monthlyCosts || []).reduce((acc, curr) => acc + curr.value, 0) / (settings?.billableHoursPerMonth || 1)).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-muted-foreground font-bold">
                                 <span>+ IMPOSTO ({settings?.serviceTax || 0}%):</span>
                                 <span className="text-foreground">R$ {(
                                    ((settings?.monthlyCosts || []).reduce((acc, curr) => acc + curr.value, 0) / (settings?.billableHoursPerMonth || 1)) * 
                                    ((settings?.serviceTax || 0) / 100)
                                 ).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-border">
                                 <span className="text-sm font-bold text-muted-foreground">SUGESTÃO (FINAL + MARGEM {settings?.serviceMargin || 0}%):</span>
                                 <span className="text-2xl font-black text-primary">
                                    R$ {(
                                       ((settings?.monthlyCosts || []).reduce((acc, curr) => acc + curr.value, 0) / (settings?.billableHoursPerMonth || 1)) * 
                                       (1 + (settings?.serviceTax || 0) / 100) * 
                                       (1 + (settings?.serviceMargin || 0) / 100)
                                    ).toFixed(2)}
                                 </span>
                              </div>
                           </div>
                           
                           <Button 
                             className="w-full bg-primary text-primary-foreground font-bold h-11 shadow-lg shadow-primary/20" 
                             onClick={() => {
                               const costs = (settings?.monthlyCosts || []).reduce((acc, curr) => acc + curr.value, 0);
                               const hours = settings?.billableHoursPerMonth || 1;
                               const tax = (settings?.serviceTax || 0) / 100;
                               const margin = (settings?.serviceMargin || 0) / 100;
                               const rate = (costs / hours) * (1 + tax) * (1 + margin);
                               updateSettings({ hourlyRate: Number(rate.toFixed(2)) });
                               toast.success(`Hora técnica atualizada para R$ ${rate.toFixed(2)}`);
                             }}
                           >
                             Aplicar Valor Calculado
                           </Button>
                        </div>
                     </div>

                     <div className="space-y-4 pt-6 mt-6 border-t border-border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Sua Hora (R$)</Label>
                            <Input 
                              type="number"
                              value={settings?.hourlyRate === 0 ? '' : (settings?.hourlyRate || 0)} 
                              onChange={(e) => updateSettings({ hourlyRate: Number(e.target.value) })} 
                              className="bg-card h-9 border-primary/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Imposto Serv. (%)</Label>
                            <Input 
                              type="number"
                              value={settings?.serviceTax === 0 ? '' : (settings?.serviceTax || 0)} 
                              onChange={(e) => updateSettings({ serviceTax: Number(e.target.value) })} 
                              className="bg-card h-9 border-primary/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Imposto Prod. (%)</Label>
                            <Input 
                              type="number"
                              value={settings?.productTax === 0 ? '' : (settings?.productTax || 0)} 
                              onChange={(e) => updateSettings({ productTax: Number(e.target.value) })} 
                              className="bg-card h-9 border-primary/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Margem Prod. (%)</Label>
                            <Input 
                              type="number"
                              value={settings?.defaultMargin === 0 ? '' : (settings?.defaultMargin || 0)} 
                              onChange={(e) => updateSettings({ defaultMargin: Number(e.target.value) })} 
                              className="bg-card h-9 border-primary/30"
                            />
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="perfil">
           <Card className="bg-card border-border">
              <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                    <UserIcon className="w-4 h-4" />
                    Configurações de Perfil
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary overflow-hidden flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg border-2 border-primary/20">
                       {user?.avatar ? (
                         <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                         user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'
                       )}
                    </div>
                    <div>
                       <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                       <Button 
                        size="sm" 
                        variant="outline" 
                        className="mb-2"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                       >
                         Alterar Foto
                       </Button>
                       <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrador do Sistema' : 'Membro da Equipe'}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Seu Nome</Label>
                       <Input 
                        value={user?.name || ''} 
                        onChange={(e) => user && setUser({...user, name: e.target.value})}
                        className="bg-secondary/20" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label>Email</Label>
                       <Input 
                        value={user?.email || ''} 
                        disabled
                        className="bg-secondary/10 opacity-50" 
                       />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4">
           <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                  <Settings className="w-4 h-4" />
                  Preferências do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label>Notificações Push</Label>
                       <p className="text-xs text-muted-foreground">Receba alertas de novos serviços no celular.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Moeda Padrão</Label>
                       <Select 
                        value={settings?.currency || 'BRL'} 
                        onValueChange={(v) => updateSettings({ currency: v })}
                       >
                          <SelectTrigger className="bg-secondary/20">
                             <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                             <SelectItem value="BRL">Real (BRL)</SelectItem>
                             <SelectItem value="USD">Dólar (USD)</SelectItem>
                             <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label>Fuso Horário</Label>
                       <Select 
                        value={settings?.timezone || 'America/Sao_Paulo'} 
                        onValueChange={(v) => updateSettings({ timezone: v })}
                       >
                          <SelectTrigger className="bg-secondary/20">
                             <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card h-[300px]">
                             <SelectItem value="Pacific/Midway">(GMT-11:00) Midway</SelectItem>
                             <SelectItem value="Pacific/Honolulu">(GMT-10:00) Hawaii</SelectItem>
                             <SelectItem value="America/Anchorage">(GMT-09:00) Alaska</SelectItem>
                             <SelectItem value="America/Los_Angeles">(GMT-08:00) Pacific Time</SelectItem>
                             <SelectItem value="America/Denver">(GMT-07:00) Mountain Time</SelectItem>
                             <SelectItem value="America/Chicago">(GMT-06:00) Central Time</SelectItem>
                             <SelectItem value="America/New_York">(GMT-05:00) Eastern Time</SelectItem>
                             <SelectItem value="America/Caracas">(GMT-04:30) Caracas</SelectItem>
                             <SelectItem value="America/Manaus">(GMT-04:00) Manaus</SelectItem>
                             <SelectItem value="America/Cuiaba">(GMT-04:00) Cuiabá</SelectItem>
                             <SelectItem value="America/Sao_Paulo">(GMT-03:00) São Paulo</SelectItem>
                             <SelectItem value="America/Recife">(GMT-03:00) Recife</SelectItem>
                             <SelectItem value="America/Argentina/Buenos_Aires">(GMT-03:00) Buenos Aires</SelectItem>
                             <SelectItem value="America/Noronha">(GMT-02:00) Fernando de Noronha</SelectItem>
                             <SelectItem value="Atlantic/Azores">(GMT-01:00) Azores</SelectItem>
                             <SelectItem value="Europe/London">(GMT+00:00) London, Lisbon</SelectItem>
                             <SelectItem value="Europe/Paris">(GMT+01:00) Paris, Berlin, Rome</SelectItem>
                             <SelectItem value="Europe/Athens">(GMT+02:00) Athens, Cairo</SelectItem>
                             <SelectItem value="Europe/Moscow">(GMT+03:00) Moscow</SelectItem>
                             <SelectItem value="Asia/Dubai">(GMT+04:00) Dubai</SelectItem>
                             <SelectItem value="Asia/Karachi">(GMT+05:00) Karachi</SelectItem>
                             <SelectItem value="Asia/Dhaka">(GMT+06:00) Dhaka</SelectItem>
                             <SelectItem value="Asia/Bangkok">(GMT+07:00) Bangkok, Jakarta</SelectItem>
                             <SelectItem value="Asia/Shanghai">(GMT+08:00) Shanghai, Hong Kong</SelectItem>
                             <SelectItem value="Asia/Tokyo">(GMT+09:00) Tokyo, Seoul</SelectItem>
                             <SelectItem value="Australia/Sydney">(GMT+10:00) Sydney</SelectItem>
                             <SelectItem value="Pacific/Noumea">(GMT+11:00) Noumea</SelectItem>
                             <SelectItem value="Pacific/Auckland">(GMT+12:00) Auckland</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="equipe">
           <TeamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamManagement() {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Eletricista',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTeamMember({ ...formData, id: editingId, userId: (team.find(m => m.id === editingId) as any)?.userId });
      toast.success('Membro da equipe atualizado!');
    } else {
      addTeamMember({ ...formData, id: Math.random().toString(36).substr(2, 9) });
      toast.success('Membro adicionado! Informe a senha ao técnico.');
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'Eletricista', phone: '', status: 'active' });
  };

  const startEdit = (member: any) => {
    setFormData(member);
    setEditingId(member.id);
    setIsAdding(true);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
            <Users className="w-4 h-4" />
            Gestão de Equipe
          </CardTitle>
          <CardDescription>Gerencie quem tem acesso ao sistema e suas funções.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="bg-primary text-primary-foreground font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Membro
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding ? (
          <div className="bg-secondary/10 p-6 rounded-xl border border-border mt-4 mb-6 animate-in slide-in-from-top-4 duration-300">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'Editar Membro' : 'Adicionar Novo Membro'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Nome Completo</Label>
                    <VoiceInput onTranscript={(text) => setFormData({...formData, name: (formData.name ? formData.name + ' ' : '') + text})} />
                  </div>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Pedro Santos" 
                    required 
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Profissional</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="pedro@suaempresa.com" 
                    required 
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha de Acesso</Label>
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Defina uma senha" 
                    required={!editingId}
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo / Função</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={v => setFormData({...formData, role: v})}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Eletricista">Eletricista</SelectItem>
                      <SelectItem value="Ajudante">Ajudante</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp</Label>
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999" 
                    className="bg-card"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                  {editingId ? 'Salvar Alterações' : 'Convidar Membro'}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="space-y-4">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email} • {member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  member.status === 'active' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                )}>
                  {member.status === 'active' ? 'Ativo' : 'Inativo'}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(member)}>
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTeamMember(member.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {team.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Sua equipe está vazia. Comece adicionando novos membros.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

