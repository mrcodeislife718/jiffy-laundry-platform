import { supabase } from './supabase';
import { Profile, Order } from './types';

export const authAPI = {
  signUp: async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  },
  signIn: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return supabase.auth.signOut();
  },
  getSession: async () => {
    return supabase.auth.getSession();
  },
  getUser: async () => {
    return supabase.auth.getUser();
  },
};

export const profileAPI = {
  getProfile: async (userId: string) => {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },
  createProfile: async (data: Profile) => {
    return supabase.from('profiles').insert([data]);
  },
  updateProfile: async (userId: string, data: Partial<Profile>) => {
    return supabase.from('profiles').update(data).eq('id', userId);
  },
};

export const orderAPI = {
  getOrders: async (userId: string) => {
    return supabase.from('orders').select('*').eq('customer_id', userId);
  },
  createOrder: async (order: Omit<Order, 'id' | 'created_at'>) => {
    return supabase.from('orders').insert([order]);
  },
};