import { supabase } from "./supabase";

export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAddress(payload) {
  const { data, error } = await supabase
    .from("addresses")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAddress(addressId, payload) {
  const { data, error } = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", addressId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(addressId) {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId);
  if (error) throw error;
}
