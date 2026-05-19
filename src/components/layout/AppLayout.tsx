
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  Package, 
  Tag,
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Search,
  Sparkles,
  Bell,
  Plus,
  User as UserIcon,
  Wrench,
  Check,
  LifeBuoy,
  Shield,
  Calculator
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '../ui/dropdown-menu';
import { useStore } from '../../store/useStore';
import { AdBanner } from '../ui/AdBanner';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import logoMestre from '../logoMestre.png';

const sidebarLinks = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Orçamentos', icon: FileText, path: '/orcamentos' },
  { name: 'Ordens de Serviço', icon: ClipboardList, path: '/os' },
  { name: 'Serviços', icon: Wrench, path: '/servicos' },
  { name: 'Materiais', icon: Tag, path: '/materiais' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
  { name: 'Financeiro', icon: DollarSign, path: '/financeiro' },
  { name: 'Estoque', icon: Package, path: '/estoque' },
  { name: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { name: 'Dimensionamentos', icon: Calculator, path: '/dimensionamentos', comingSoon: true },
  { name: 'Planos', icon: Sparkles, path: '/planos' },
  { name: 'Suporte', icon: LifeBuoy, path: '/suporte' },
  { name: 'Privacidade', icon: Shield, path: '/privacidade' },
  { name: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, notifications, markNotificationRead, clearNotifications } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredLinks = sidebarLinks.filter(link => {
    if (user?.role === 'membro') {
      return ['Dashboard', 'Clientes', 'Ordens de Serviço', 'Agenda', 'Dimensionamentos', 'Suporte', 'Privacidade'].includes(link.name);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="p-6 flex flex-col items-center justify-center border-b border-primary/5">
            <div className="w-full flex items-center justify-center overflow-hidden">
               <img 
                 src={logoMestre} 
                 alt="Mestre Soluções Elétricas" 
                 style={{ width: '250px' }} 
                 className="object-contain" 
               />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isComingSoon = (link as any).comingSoon;
              
              const linkContent = (
                <>
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 truncate">{link.name}</span>
                  {isComingSoon && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-[8px] px-1 py-0 h-4 border-none font-black uppercase tracking-tighter shrink-0 ring-0">
                      BREVE
                    </Badge>
                  )}
                </>
              );

              if (isComingSoon) {
                return (
                  <div
                    key={link.path}
                    className="flex items-center gap-3 px-4 py-3 text-zinc-600 cursor-not-allowed opacity-60 rounded-r-md select-none"
                    title="Funcionalidade em desenvolvimento"
                  >
                    {linkContent}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors rounded-r-md",
                    isActive 
                      ? "bg-secondary text-primary border-l-2 border-primary font-medium" 
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {linkContent}
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t">
             <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.companyName}</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center gap-3">
              <img 
                src={logoMestre} 
                alt="Mestre" 
                className="h-8 lg:h-10 w-auto object-contain" 
              />
              <div className="hidden lg:block h-6 w-px bg-border mx-1" />
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-black tracking-tighter leading-none">MESTRE</span>
                <span className="text-[8px] text-primary font-bold uppercase tracking-widest leading-none">
                  Soluções Elétricas
                </span>
              </div>
            </div>

            <div className="hidden xl:flex items-center bg-secondary rounded-full px-4 py-2 w-64 lg:w-80 ml-4">
              <Search className="w-4 h-4 text-zinc-500 mr-2" />
              <input 
                type="text" 
                placeholder="Busca global..." 
                className="bg-transparent border-none text-sm focus:outline-none w-full placeholder-zinc-500"
              />
            </div>
          </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {user?.role === 'admin' && (
                <Link to="/orcamentos">
                  <Button size="sm" className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-[0_4px_20px_rgba(250,204,21,0.2)]">
                    <Plus className="w-4 h-4" />
                    <span>NOVO ORÇAMENTO</span>
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(
                  "relative h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                )}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-card border-border">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notificações</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px]">
                          {unreadCount} novas
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[300px]">
                    <DropdownMenuGroup>
                      {notifications.length > 0 ? (
                        <div className="flex flex-col">
                          {notifications.map((notification) => (
                            <DropdownMenuItem 
                              key={notification.id}
                              className={cn(
                                "p-4 border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer relative",
                                !notification.read && "bg-primary/5"
                              )}
                              onClick={() => markNotificationRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                  notification.type === 'warning' ? "bg-yellow-500" :
                                  notification.type === 'error' ? "bg-red-500" : "bg-blue-500"
                                )} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">{notification.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.description}</p>
                                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">
                                    {formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale: ptBR })}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="absolute top-4 right-4 h-2 w-2 bg-primary rounded-full" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground/30">
                          <Bell className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Nenhuma notificação por aqui.</p>
                        </div>
                      )}
                    </DropdownMenuGroup>
                  </ScrollArea>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="justify-center text-xs text-primary font-bold hover:bg-primary/10"
                    onClick={clearNotifications}
                  >
                    LIMPAR TUDO
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="h-8 w-px bg-border hidden sm:block mx-2" />
              
              {/* Other icon removed as per request */}
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <AdBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
