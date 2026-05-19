
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Headphones, Mail, MessageSquare, Phone, ExternalLink, LifeBuoy, BookOpen, AlertCircle } from 'lucide-react';

export function Suporte() {
  const supportChannels = [
    {
      title: 'WhatsApp Direct',
      description: 'Fale diretamente com nossa equipe técnica.',
      icon: MessageSquare,
      action: 'Chamar no WhatsApp',
      link: 'https://wa.me/5516993187640',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      title: 'E-mail de Suporte',
      description: 'Envie suas dúvidas e sugestões por e-mail.',
      icon: Mail,
      action: 'Enviar E-mail',
      link: 'mailto:suporte@mestresolucoes.com',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'Central de Ajuda',
      description: 'Tutoriais e documentos sobre como usar o sistema.',
      icon: BookOpen,
      action: 'Acessar Central',
      link: '#',
      color: 'bg-purple-500/10 text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Suporte e Ajuda</h1>
        <p className="text-muted-foreground">
          Estamos aqui para ajudar você a tirar o máximo proveito do seu sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportChannels.map((channel, index) => (
          <Card key={index} className="bg-card border-primary/10 hover:border-primary/30 transition-all group">
            <CardHeader>
              <div className={`w-12 h-12 rounded-2xl ${channel.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <channel.icon className="w-6 h-6" />
              </div>
              <CardTitle>{channel.title}</CardTitle>
              <CardDescription>{channel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={channel.link} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full gap-2">
                  {channel.action}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-primary" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { q: 'Como alterar o logo nos orçamentos?', a: 'Vá em Configurações > Dados da Empresa e faça o upload do seu logo. Você também pode ajustar o tamanho e posição no PDF.' },
              { q: 'Posso usar o sistema sem internet?', a: 'O sistema requer conexão com a internet para sincronizar os dados com a nuvem e garantir a segurança das informações.' },
              { q: 'Como gerar uma Ordem de Serviço?', a: 'No menu lateral, clique em Ordens de Serviço > Nova OS, ou converta um orçamento aprovado diretamente.' }
            ].map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/20 border border-primary/5">
                <p className="font-bold text-sm mb-1">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Estado do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-primary/5 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Todos os serviços operacionais</span>
              </div>
              <span className="text-xs text-muted-foreground">100% Online</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banco de Dados</span>
                <span className="text-green-500 font-bold uppercase text-[10px]">Normal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Geração de PDF</span>
                <span className="text-green-500 font-bold uppercase text-[10px]">Normal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sincronização</span>
                <span className="text-green-500 font-bold uppercase text-[10px]">Normal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
