
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Zap, Sun, Calculator, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Dimensionamentos() {
  const { user, settings } = useStore();
  const plan = settings?.plan || 'free';
  const isAdmin = user?.role === 'admin';

  // State para Elétrico
  const [eletrico, setEletrico] = useState({
    potencia: '',
    tensao: '220',
    fase: 'monofasico',
    distancia: '',
    fatorPotencia: '0.92',
    quedaAdmissivel: '2'
  });

  // State para Solar
  const [solar, setSolar] = useState({
    consumoMensal: '',
    hsp: '5.0', // Horas de Sol Pleno (média BR)
    potenciaPainel: '550',
    perdaSistema: '20'
  });

  // Cálculos Elétricos
  const calcularEletrico = () => {
    const P = parseFloat(eletrico.potencia) || 0;
    const V = parseFloat(eletrico.tensao) || 0;
    const L = parseFloat(eletrico.distancia) || 0;
    const FP = parseFloat(eletrico.fatorPotencia) || 1;
    const Q = parseFloat(eletrico.quedaAdmissivel) || 2;

    if (!P || !V) return null;

    // Corrente de Projeto (Ib)
    let Ib = 0;
    if (eletrico.fase === 'monofasico') {
      Ib = P / (V * FP);
    } else {
      Ib = P / (Math.sqrt(3) * V * FP);
    }

    // Disjuntor sugerido (In >= Ib)
    const disjuntoresComuns = [6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125];
    const disjuntor = disjuntoresComuns.find(d => d >= Ib * 1.15) || 'Especial';

    // Seção do cabo por queda de tensão (estimativa simplificada)
    // S = (2 * L * Ib * cosphi) / (rho * DV) -> simplificado
    const secoes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
    const caboSugerido = secoes.find(s => s >= (Ib / 6)) || 50; // Regra de bolso inicial

    return { Ib, disjuntor, caboSugerido };
  };

  // Cálculos Solar
  const calcularSolar = () => {
    const consumo = parseFloat(solar.consumoMensal) || 0;
    const hsp = parseFloat(solar.hsp) || 0;
    const pPainel = parseFloat(solar.potenciaPainel) || 0;
    const perdas = parseFloat(solar.perdaSistema) || 20;

    if (!consumo || !hsp) return null;

    // Potência do Sistema (kWp) = (Consumo / 30) / HSP * (1 + Perdas%)
    const potenciakWp = (consumo / 30) / hsp / (1 - perdas / 100);
    const numPaineis = Math.ceil((potenciakWp * 1000) / pPainel);
    const areaEstimada = numPaineis * 2.2; // ~2.2m2 por painel 550W

    return { potenciakWp, numPaineis, areaEstimada };
  };

  const resEletrico = calcularEletrico();
  const resSolar = calcularSolar();

  const isLocked = (feature: string) => {
    if (isAdmin) return false;
    if (feature === 'solar_basic' && plan === 'free') return true;
    if (feature === 'complete' && plan !== 'premium') return true;
    return false;
  };

  return (
    <div className="relative min-h-[500px] flex flex-col space-y-6 max-w-5xl mx-auto">
      {/* Overlay de Bloqueio */}
      <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-3xl border border-primary/20 shadow-2xl">
        <div className="bg-card p-8 rounded-3xl border border-primary/10 shadow-xl max-w-md animate-in zoom-in duration-300">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8 text-primary animate-pulse" />
           </div>
           <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Em Breve</h2>
           <p className="text-muted-foreground text-sm mb-6 font-medium">
             Estamos finalizando as ferramentas de dimensionamento elétrico e fotovoltáico para garantir a máxima precisão técnica.
           </p>
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                 <CheckCircle2 className="w-4 h-4" />
                 Cálculos automáticos NBR-5410
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                 <Sun className="w-4 h-4" />
                 Dimensionamento Solar com Mapas
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 opacity-20 pointer-events-none grayscale">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dimensionamentos Profissionais</h1>
          <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Beta</span>
        </div>
        <p className="text-muted-foreground">Ferramentas técnicas para cálculos elétricos e fotovoltaicos em fase de implementação.</p>
      </div>

      <Tabs defaultValue="eletrico" className="w-full opacity-20 pointer-events-none grayscale">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1">
          <TabsTrigger value="eletrico" className="gap-2 relative">
            <Zap className="w-4 h-4 text-primary" />
            Elétrico
          </TabsTrigger>
          <TabsTrigger value="solar" className="gap-2 relative">
            <Sun className="w-4 h-4 text-primary" />
            Fotovoltaico
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full scale-75">EM BREVE</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eletrico" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-card border-primary/5">
              <CardHeader>
                <CardTitle>Dados do Circuito</CardTitle>
                <CardDescription>Informe os parâmetros básicos para dimensionamento.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Potência Total (Watts)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 5500" 
                    value={eletrico.potencia}
                    onChange={e => setEletrico({...eletrico, potencia: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tensão (Volts)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={eletrico.tensao}
                    onChange={e => setEletrico({...eletrico, tensao: e.target.value})}
                    disabled={!isAdmin}
                  >
                    <option value="127">127V</option>
                    <option value="220">220V</option>
                    <option value="380">380V</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Rede</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={eletrico.fase}
                    onChange={e => setEletrico({...eletrico, fase: e.target.value})}
                    disabled={!isAdmin}
                  >
                    <option value="monofasico">Monofásico</option>
                    <option value="trifasico">Trifásico</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Distância (Metros)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 25" 
                    value={eletrico.distancia}
                    onChange={e => setEletrico({...eletrico, distancia: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Resultado Sugerido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resEletrico ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Corrente de Trabalho</p>
                        <p className="text-2xl font-black text-primary">{resEletrico.Ib.toFixed(1)}A</p>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-card border border-primary/10 rounded-xl">
                        <span className="text-xs font-medium">Disjuntor Recomendado</span>
                        <span className="font-bold text-primary">{resEletrico.disjuntor}A</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-card border border-primary/10 rounded-xl">
                        <span className="text-xs font-medium">Cabo Sugerido (PVC)</span>
                        <span className="font-bold text-primary">{resEletrico.caboSugerido}mm²</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Cálculo simplificado. Sempre consulte as normas NBR-5410.
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-xs italic">
                      Preencha os campos para calcular.
                    </div>
                  )}
                </CardContent>
              </Card>

              {isLocked('complete') && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-medium text-yellow-600 dark:text-yellow-500 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  Dimensionamento elétrico avançado (queda de tensão exata) disponível nos planos Pro e Premium.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="solar" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-card border-primary/5">
              <CardHeader>
                <CardTitle>Configuração Fotovoltaica</CardTitle>
                <CardDescription>Calcule o tamanho aproximado do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Consumo Médio (kWh/mês)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 500" 
                    value={solar.consumoMensal}
                    onChange={e => setSolar({...solar, consumoMensal: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horas de Sol Pleno (HSP)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={solar.hsp}
                    onChange={e => setSolar({...solar, hsp: e.target.value})}
                    disabled={!isAdmin}
                  />
                  <p className="text-[10px] text-muted-foreground">Média Brasil varia entre 4.0 e 5.5</p>
                </div>
                <div className="space-y-2">
                  <Label>Potência do Painel (Watts)</Label>
                  <Input 
                    type="number" 
                    value={solar.potenciaPainel}
                    onChange={e => setSolar({...solar, potenciaPainel: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perdas do Sistema (%)</Label>
                  <Input 
                    type="number" 
                    value={solar.perdaSistema}
                    onChange={e => setSolar({...solar, perdaSistema: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                   <div className="bg-card border border-primary/20 p-4 rounded-2xl shadow-2xl text-center rotate-3">
                      <p className="text-xs font-black text-primary uppercase tracking-tighter">Lançamento em Breve</p>
                      <p className="text-[10px] text-muted-foreground">Integração com mapas e HSP exata.</p>
                   </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    Estimativa do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resSolar ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Potência do Gerador</p>
                        <p className="text-3xl font-black text-primary">{resSolar.potenciakWp.toFixed(2)} kWp</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-card border border-primary/10 rounded-xl text-center">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Painéis</p>
                          <p className="text-xl font-bold">{resSolar.numPaineis}</p>
                        </div>
                        <div className="p-3 bg-card border border-primary/10 rounded-xl text-center">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Área (m²)</p>
                          <p className="text-xl font-bold">{resSolar.areaEstimada.toFixed(0)}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full text-xs font-bold gap-2">
                        Gerar Orç. PV Premium
                        <Info className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-xs italic">
                      Preencha o consumo mensal.
                    </div>
                  )}
                </CardContent>
              </Card>

              {isLocked('solar_basic') && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3">
                  <p className="text-xs font-bold">Funcionalidade Avançada</p>
                  <p className="text-[10px] text-muted-foreground">Faça o upgrade para o plano Pro para integrar estes cálculos diretamente em seus orçamentos.</p>
                  <Button size="sm" variant="default" className="w-full text-[10px] h-8 font-bold">VER PLANOS</Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
