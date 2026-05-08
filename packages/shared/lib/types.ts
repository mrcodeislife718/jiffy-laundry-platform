export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'driver' | 'laundromat_operator' | 'admin';
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  driver_id?: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
};