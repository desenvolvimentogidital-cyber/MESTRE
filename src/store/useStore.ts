
import { create } from 'zustand';
import { User, Client, InventoryItem, Quote, OS, Transaction, Event } from '../types';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  addDoc 
} from 'firebase/firestore';

interface MestreState {
  user: User | null;
  clients: Client[];
  inventory: InventoryItem[];
  quotes: Quote[];
  osList: OS[];
  transactions: Transaction[];
  events: Event[];
  services: { id: string; userId: string; name: string; category: string; price: number; status: string }[];
  materials: { id: string; userId: string; name: string; unit: string; price: number; category: string; status: string }[];
  notifications: { id: string; userId: string; title: string; description: string; date: string; read: boolean; type: 'info' | 'warning' | 'error' }[];
  team: { id: string; userId: string; name: string; email: string; role: string; phone: string; status: 'active' | 'inactive' }[];
  
  // Actions
  setUser: (user: User | null) => void;
  initialize: () => (() => void) | void;
  
  addClient: (client: Omit<Client, 'userId'>) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addInventoryItem: (item: Omit<InventoryItem, 'userId'>) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  
  addQuote: (quote: Omit<Quote, 'userId'>) => Promise<void>;
  updateQuote: (quote: Quote) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  
  addOS: (os: Omit<OS, 'userId'>) => Promise<void>;
  updateOS: (os: OS) => Promise<void>;
  deleteOS: (id: string) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleTransactionPaid: (id: string, isPaid: boolean) => Promise<void>;
 
  addService: (service: { id: string; name: string; category: string; price: number; status: string }) => Promise<void>;
  updateService: (service: { id: string; userId: string; name: string; category: string; price: number; status: string }) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addMaterial: (material: { id: string; name: string; unit: string; price: number; category: string; status: string }) => Promise<void>;
  updateMaterial: (material: { id: string; userId: string; name: string; unit: string; price: number; category: string; status: string }) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;

  addNotification: (notification: { title: string; description: string; type: 'info' | 'warning' | 'error' }) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  addTeamMember: (member: { id: string; name: string; email: string; role: string; phone: string; status: 'active' | 'inactive' }) => Promise<void>;
  updateTeamMember: (member: { id: string; userId: string; name: string; email: string; role: string; phone: string; status: 'active' | 'inactive' }) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
}

export const useStore = create<MestreState>((set, get) => ({
  user: null,
  clients: [],
  inventory: [],
  quotes: [],
  osList: [],
  transactions: [],
  events: [],
  services: [],
  materials: [],
  notifications: [],
  team: [],

  setUser: (user) => set({ user }),

  initialize: () => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to changes in all collections
    const unsubscibers: (() => void)[] = [];

    const collections = [
      { name: 'clients', setter: (data: any[]) => set({ clients: data }) },
      { name: 'inventory', setter: (data: any[]) => set({ inventory: data }) },
      { name: 'quotes', setter: (data: any[]) => set({ quotes: data }) },
      { name: 'osList', setter: (data: any[]) => set({ osList: data }) },
      { name: 'transactions', setter: (data: any[]) => set({ transactions: data }) },
      { name: 'services', setter: (data: any[]) => set({ services: data }) },
      { name: 'materials', setter: (data: any[]) => set({ materials: data }) },
      { name: 'notifications', setter: (data: any[]) => set({ notifications: data }) },
      { name: 'team', setter: (data: any[]) => set({ team: data }) },
    ];

    collections.forEach((col) => {
      const q = query(collection(db, col.name), where('userId', '==', user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        col.setter(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, col.name);
      });
      unsubscibers.push(unsub);
    });

    return () => unsubscibers.forEach(unsub => unsub());
  },

  addClient: async (client) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'clients', client.id), { ...client, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'clients');
    }
  },
  updateClient: async (client) => {
    try {
      await updateDoc(doc(db, 'clients', client.id), { ...client });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${client.id}`);
    }
  },
  deleteClient: async (id) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  },

  addInventoryItem: async (item) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'inventory', item.id), { ...item, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inventory');
    }
  },
  updateInventoryItem: async (item) => {
    try {
      await updateDoc(doc(db, 'inventory', item.id), { ...item });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inventory/${item.id}`);
    }
  },
  deleteInventoryItem: async (id) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
    }
  },

  addQuote: async (quote) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'quotes', quote.id), { ...quote, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'quotes');
    }
  },
  updateQuote: async (quote) => {
    try {
      await updateDoc(doc(db, 'quotes', quote.id), { ...quote });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `quotes/${quote.id}`);
    }
  },
  deleteQuote: async (id) => {
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `quotes/${id}`);
    }
  },

  addOS: async (os) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'osList', os.id), { ...os, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'osList');
    }
  },
  updateOS: async (os) => {
    try {
      await updateDoc(doc(db, 'osList', os.id), { ...os });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `osList/${os.id}`);
    }
  },
  deleteOS: async (id) => {
    try {
      await deleteDoc(doc(db, 'osList', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `osList/${id}`);
    }
  },

  addTransaction: async (transaction) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'transactions', transaction.id), { ...transaction, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    }
  },
  deleteTransaction: async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  },
  toggleTransactionPaid: async (id, isPaid) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { isPaid: !isPaid });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${id}`);
    }
  },

  addService: async (service) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'services', service.id), { ...service, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'services');
    }
  },
  updateService: async (service) => {
    try {
      await updateDoc(doc(db, 'services', service.id), { ...service });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${service.id}`);
    }
  },
  deleteService: async (id) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  },

  addMaterial: async (material) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'materials', material.id), { ...material, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'materials');
    }
  },
  updateMaterial: async (material) => {
    try {
      await updateDoc(doc(db, 'materials', material.id), { ...material });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `materials/${material.id}`);
    }
  },
  deleteMaterial: async (id) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `materials/${id}`);
    }
  },

  addNotification: async (notification) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const id = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'notifications', id), { 
        ...notification, 
        id, 
        userId: user.uid,
        date: new Date().toISOString(), 
        read: false 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'notifications');
    }
  },
  markNotificationRead: async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  },
  clearNotifications: async () => {
    // This is expensive in Firestore if there are many docs, but for small app it's okay to loop
    const notifications = get().notifications;
    const promises = notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)));
    await Promise.all(promises);
  },

  addTeamMember: async (member) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'team', member.id), { ...member, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'team');
    }
  },
  updateTeamMember: async (member) => {
    try {
      await updateDoc(doc(db, 'team', member.id), { ...member });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `team/${member.id}`);
    }
  },
  deleteTeamMember: async (id) => {
    try {
      await deleteDoc(doc(db, 'team', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team/${id}`);
    }
  },
}));
