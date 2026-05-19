
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export function Privacidade() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Política de Privacidade</h1>
        <p className="text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Lock, title: 'Seus dados protegidos', desc: 'Usamos criptografia de ponta para seus dados.' },
          { icon: Eye, title: 'Total transparência', desc: 'Você decide o que compartilha conosco.' },
          { icon: Shield, title: 'Segurança Firebase', desc: 'Infraestrutura segura provida pelo Google.' }
        ].map((item, i) => (
          <Card key={i} className="bg-card border-primary/5">
            <CardContent className="pt-6 text-center">
              <item.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-primary/5">
        <CardContent className="p-8">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  1. Introdução
                </h2>
                <p>
                  Esta Política de Privacidade descreve como coletamos, usamos e protegemos as informações fornecidas por você ao utilizar o nosso sistema de gestão. Ao utilizar os nossos serviços, você concorda com a coleta e o uso de informações de acordo com esta política.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  2. Coleta de Informações
                </h2>
                <p>
                  Coletamos informações que você nos fornece diretamente, tais como:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Dados de perfil (nome, e-mail, foto);</li>
                  <li>Dados da empresa (nome, CNPJ, telefone, endereço);</li>
                  <li>Dados de clientes e orçamentos inseridos no sistema;</li>
                  <li>Logs de acesso e transações.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  3. Uso das Informações
                </h2>
                <p>
                  Suas informações são utilizadas para:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Fornecer e manter o serviço (geração de PDFs, gestão de agenda);</li>
                  <li>Personalizar a sua experiência nos documentos gerados;</li>
                  <li>Processar pagamentos (se aplicável);</li>
                  <li>Melhorar as funcionalidades do sistema.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  4. Armazenamento e Segurança
                </h2>
                <p>
                  Utilizamos o Google Firebase para o armazenamento seguro de seus dados. Empregamos medidas de segurança técnicas e administrativas razoáveis para proteger suas informações contra perda, roubo, uso indevido e acesso não autorizado. No entanto, nenhum método de transmissão pela Internet é 100% seguro.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  5. Seus Direitos
                </h2>
                <p>
                  Respeitamos os seus direitos conforme a Lei Geral de Proteção de Dados (LGPD). Você tem o direito de:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>Acessar, atualizar ou excluir suas informações pessoais;</li>
                  <li>Revogar o consentimento para o processamento de dados;</li>
                  <li>Solicitar a portabilidade dos seus dados.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  6. Alterações à Política
                </h2>
                <p>
                  Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova política nesta página e atualizando a data de última atualização no topo.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  7. Contato
                </h2>
                <p>
                  Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através do e-mail: <span className="text-primary font-medium">contato@mestresolucoes.com</span>
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
