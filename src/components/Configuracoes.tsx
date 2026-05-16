
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Settings, User as UserIcon, Building2, Bell, Shield, Palette, Database, Smartphone, Upload, Trash2, CheckCircle2, Users, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function Configuracoes() {
  const { user, setUser, team, addTeamMember, updateTeamMember, deleteTeamMember } = useStore();
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

  const handleSave = async () => {
    if (!user || !auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
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
                    <Label>Nome da Empresa</Label>
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
                    <Label>Endereço Completo</Label>
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
                    <Label>Observações do Orçamento</Label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-md bg-secondary/20 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user?.quoteTerms || ''}
                      onChange={(e) => user && setUser({...user, quoteTerms: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Rodapé da Ordem de Serviço</Label>
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
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                       JP
                    </div>
                    <div>
                       <Button size="sm" variant="outline" className="mb-2">Alterar Foto</Button>
                       <p className="text-xs text-muted-foreground">Administrador do Sistema</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Seu Nome</Label>
                       <Input defaultValue="João Elétrica" className="bg-secondary/20" />
                    </div>
                    <div className="space-y-2">
                       <Label>Email Principal</Label>
                       <Input defaultValue="joao@eletrica.com" className="bg-secondary/20" />
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
                       <Select defaultValue="brl">
                          <SelectTrigger className="bg-secondary/20">
                             <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                             <SelectItem value="brl">Real (BRL)</SelectItem>
                             <SelectItem value="usd">Dólar (USD)</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label>Fuso Horário</Label>
                       <Select defaultValue="sp">
                          <SelectTrigger className="bg-secondary/20">
                             <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                             <SelectItem value="sp">São Paulo (GMT-3)</SelectItem>
                             <SelectItem value="manaus">Manaus (GMT-4)</SelectItem>
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
      toast.success('Membro adicionado à equipe!');
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'Eletricista', phone: '', status: 'active' });
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
                  <Label>Nome Completo</Label>
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

