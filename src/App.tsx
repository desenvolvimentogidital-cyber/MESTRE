/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Toaster } from 'sonner';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Clientes } from './components/Clientes';
import { Orcamentos } from './components/Orcamentos';
import { OrdensServico } from './components/OrdensServico';
import { Agenda } from './components/Agenda';
import { Financeiro } from './components/Financeiro';
import { Estoque } from './components/Estoque';
import { Relatorios } from './components/Relatorios';
import { Configuracoes } from './components/Configuracoes';
import { Suporte } from './components/Suporte';
import { Privacidade } from './components/Privacidade';
import { Planos } from './components/Planos';
import { Dimensionamentos } from './components/Dimensionamentos';
import { Servicos } from './components/Servicos';
import { Materiais } from './components/Materiais';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from './store/useStore';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useStore((state) => state.setUser);
  const initializeStore = useStore((state) => state.initialize);

  useEffect(() => {
    let storeUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Initialize real-time listeners for data
        const unsub = initializeStore();
        if (typeof unsub === 'function') {
          storeUnsubscribe = unsub;
        }

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          } else {
            // Fallback to basic info if doc doesn't exist yet
            setUser({
              id: user.uid,
              name: user.displayName || 'Mestre',
              email: user.email || '',
              role: 'admin',
              companyName: '',
              phone: '',
              address: '',
              emailContact: '',
              instagram: '',
              quoteTerms: '',
              osTerms: ''
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        if (storeUnsubscribe) {
          storeUnsubscribe();
          storeUnsubscribe = undefined;
        }
      }
      setIsInitializing(false);
    });

    return () => {
      unsubscribe();
      if (storeUnsubscribe) storeUnsubscribe();
    };
  }, [setUser, initializeStore]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Router>
        {!isAuthenticated ? (
          <>
            <Helmet>
              <title>Login | Gestão Profissional</title>
            </Helmet>
            <Login onLogin={() => setIsAuthenticated(true)} />
          </>
        ) : (
          <AppLayout>
            <Helmet>
              <title>Sistema | Gestão Profissional</title>
            </Helmet>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/os" element={<OrdensServico />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/dimensionamentos" element={<Dimensionamentos />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/suporte" element={<Suporte />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/materiais" element={<Materiais />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        )}
        <Toaster position="top-right" richColors theme="dark" />
      </Router>
    </HelmetProvider>
  );
}

