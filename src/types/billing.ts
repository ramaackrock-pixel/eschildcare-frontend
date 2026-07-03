export type InvoiceStatus = 'PAID' | 'OVERDUE' | 'PENDING' | 'PARTIALLY PAID';

export interface Medicine {
  name: string;
  intakeTime?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  night?: string;
  timing: string;
  quantity?: string;
  price: number;
}

export interface Invoice {
  id: string;
  patientName: string;
  pid?: string;
  patientId?: string;
  initials: string;
  initialsBg: string; // Tailwind class, e.g., 'bg-primary/10 text-primary'
  date: string;
  consultingFee?: number;
  otherCharges?: number;
  fareBreakdown?: { item: string; amount: number }[];
  medicines?: Medicine[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  discount?: number;
  status: InvoiceStatus;
  branch?: string;
  paymentMode?: string;
  brace?: string;
  nutraceutical?: string;
  lab?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingStat {
  title: string;
  value: string;
  trend?: string;
  subtext?: string;
  iconName: 'Banknote' | 'ClipboardCheck' | 'AlertCircle';
  variant: 'primary' | 'secondary' | 'accent' | 'destructive';
}
