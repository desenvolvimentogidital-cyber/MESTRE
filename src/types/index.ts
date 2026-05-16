
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  companyLogo?: string;
  companyName?: string;
  phone?: string;
  address?: string;
  emailContact?: string;
  instagram?: string;
  quoteTerms?: string;
  osTerms?: string;
  role: 'admin' | 'user';
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  whatsapp: string;
  document: string; // CPF/CNPJ
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  observations: string;
  photo?: string;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  code: string;
  supplier: string;
};

export type QuoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ANALYSIS';

export type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  total: number;
  type: 'material' | 'service';
};

export type Quote = {
  id: string;
  userId: string;
  clientId: string;
  date: string;
  validity: string;
  description: string;
  items: QuoteItem[];
  laborValue: number;
  shippingValue: number;
  discount: number;
  totalValue: number;
  status: QuoteStatus;
  warranty: string;
  executionTime: string;
  createdAt: string;
};

export type OSStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED' | 'WAITING_MATERIAL';

export type OS = {
  id: string;
  userId: string;
  clientId: string;
  quoteId?: string;
  responsibleId: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  status: OSStatus;
  usedMaterials: { itemId: string; quantity: number }[];
  technicalNotes: string;
  checklist: { item: string; done: boolean }[];
  photosBefore: string[];
  photosAfter: string[];
  clientSignature?: string;
  location?: string;
  items: QuoteItem[];
  totalValue: number;
  createdAt: string;
};

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionCategory = 'SERVICE' | 'MATERIAL' | 'FUEL' | 'TOOLS' | 'FOOD' | 'OTHER';

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'PIX' | 'CARD' | 'CASH' | 'TRANSFER';
  isPaid: boolean;
};

export type Event = {
  id: string;
  userId: string;
  title: string;
  start: string;
  end: string;
  type: 'SERVICE' | 'RETURN' | 'VISIT';
  status: OSStatus;
  clientId?: string;
};
