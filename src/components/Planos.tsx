
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Check, Sparkles, Zap, Shield, Crown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

export function Planos() {
  const { settings, updateSettings } = useStore();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    setLoadingPlan(planName);
    try {
      // Aqui no futuro entraria a integração com Stripe/Mercado Pago
      await updateSettings({ plan: planName.toLowerCase() as any });
      toast.success(`Plano ${planName} ativado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao atualizar plano.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'R$ 0',
      description: 'Ideal para quem está começando agora.',
      icon: Zap,
      features: [
        'Até 10 Orçamentos/mês',
        'Gestão de Clientes básica',
        'Relatórios Simples',
        'Suporte via E-mail',
        '1 Usuário'
      ],
      buttonText: settings?.plan === 'free' ? 'Plano Atual' : 'Downgrade para Free',
      current: settings?.plan === 'free' || !settings?.plan,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 49,90',
      period: '/mês',
      description: 'Perfeito para profissionais autônomos.',
      icon: Sparkles,
      features: [
        'Orçamentos Ilimitados',
        'Ordens de Serviço ilimitadas',
        'Gestão de Estoque',
        'Assinatura Digital de OS',
        'Dimensionamento Solar Básico (Em breve)',
        'Suporte Prioritário'
      ],
      buttonText: settings?.plan === 'pro' ? 'Plano Atual' : 'Fazer Upgrade',
      current: settings?.plan === 'pro',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 99,90',
      period: '/mês',
      description: 'A solução completa para sua empresa.',
      icon: Crown,
      features: [
        'Tudo do Plano Pro',
        'Dimensionamento Elétrico e Solar Completo (Em breve)',
        'Relatórios Avançados',
        'Personalização de PDF Premium',
        'Suporte VIP via WhatsApp',
        'Usuários Ilimitados'
      ],
      buttonText: settings?.plan === 'premium' ? 'Plano Atual' : 'Contratar Premium',
      current: settings?.plan === 'premium',
      popular: false
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Escolha o plano ideal para você</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Potencialize seus resultados com ferramentas profissionais de gestão e orçamentos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative flex flex-col border-primary/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
              plan.popular ? "border-primary shadow-lg scale-105 z-10" : "bg-card/50"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Mais Popular
              </div>
            )}
            
            <CardHeader className="text-center pt-8">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4",
                plan.popular ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
              )}>
                <plan.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      plan.popular ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="pb-8">
              <Button 
                variant={plan.current ? 'outline' : 'default'} 
                className={cn(
                  "w-full font-bold",
                  plan.popular && "bg-primary hover:bg-primary/90"
                )}
                disabled={plan.current || loadingPlan === plan.name}
                onClick={() => handleUpgrade(plan.name)}
              >
                {loadingPlan === plan.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2 justify-center md:justify-start text-primary">
              <Shield className="w-5 h-5" />
              Garantia de Satisfação
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Teste qualquer plano pago por 7 dias. Se não estiver satisfeito, devolvemos seu dinheiro sem burocracia.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 border-primary/20 hover:bg-primary/10">
            Falar com Consultor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
