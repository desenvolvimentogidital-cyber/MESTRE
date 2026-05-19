
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Loader2, Sparkles, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import logoMestre from './logoMestre.png';
import { auth, db } from '../lib/firebase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { isInstallable, isIOS, isStandalone, isMobile, installApp } = usePWAInstall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        toast.info('Criando sua conta de Mestre...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile
        await updateProfile(user, { displayName: name });
        
        // Create user doc in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: name,
          email: email,
          companyName: '',
          role: 'admin',
          createdAt: new Date().toISOString()
        });

        toast.success('Conta criada com sucesso! Bem-vindo.');
      } else {
        toast.info('Validando credenciais...');
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vindo ao MESTRE!');
      }
      onLogin();
    } catch (error: any) {
      console.error(error);
      const message = error.code === 'auth/invalid-credential' 
        ? 'Email ou senha incorretos.' 
        : error.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso.'
        : error.code === 'auth/weak-password'
        ? 'A senha deve ter pelo menos 6 caracteres.'
        : 'Ocorreu um erro. Verifique se o login por e-mail está ativo no Firebase.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-8">
            <div className="w-full flex flex-col items-center justify-center overflow-hidden">
               <img 
                 src={logoMestre} 
                 alt="Mestre Soluções Elétricas" 
                 style={{ width: '250px' }} 
                 className="object-contain" 
               />
            </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta mestre'}</CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Entre com suas credenciais para gerenciar seus serviços.' 
                : 'Preencha os dados abaixo para começar a usar o sistema.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    className="bg-secondary/30 border-primary/10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="bg-secondary/30 border-primary/10 focus-visible:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === 'login' && (
                    <Button variant="link" className="px-0 font-normal text-xs text-primary/70 hover:text-primary" type="button">
                      Esqueceu a senha?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    className="bg-secondary/30 border-primary/10 focus-visible:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                 <div className="h-px flex-1 bg-primary/10" />
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                   {mode === 'login' ? 'Acesso Premium' : 'Cadastro Rápido'}
                 </span>
                 <div className="h-px flex-1 bg-primary/10" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-primary text-black font-black h-11 text-lg shadow-lg shadow-primary/20 group hover:scale-[1.02] transition-transform" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className={cn("mr-2 h-5 w-5", mode === 'login' ? "fill-black" : "text-black")} />
                    {mode === 'login' ? 'Entrar no Sistema' : 'Cadastrar agora'}
                  </>
                )}
              </Button>

              {!isStandalone && isMobile && (isInstallable || isIOS) && (
                <Button 
                  variant="ghost" 
                  className="w-full h-11 font-bold text-primary flex items-center gap-2 animate-bounce mt-2" 
                  onClick={installApp}
                  type="button"
                >
                  <Smartphone className="w-5 h-4" />
                  {isIOS ? 'Como Instalar no iPhone' : 'Instalar Aplicativo (PWA)'}
                </Button>
              )}

              <div className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <Button 
                  type="button"
                  variant="link" 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="px-0 font-bold text-primary"
                >
                  {mode === 'login' ? 'Crie agora' : 'Faça login'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        
        <p className="text-center mt-8 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
