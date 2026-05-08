import { supabase } from "./supabase";

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCustomerOrders(customerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      order_items(*),
      order_status_events(*),
      laundromats(*)`)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      customer:customer_id(id, full_name, phone, email),
      driver:driver_id(full_name, phone),
      laundromats(*)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      order_items(*),
      order_status_events(*),
      driver:driver_id(full_name, phone),
      laundromats(*),
      addresses:pickup_address_id(*)`)
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrderWithItems({ orderPayload, items }) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();
  if (orderError) throw orderError;

  const rows = items.map((item) => ({
    order_id: order.id,
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    line_total: item.line_total,
  }));

  const { error: itemError } = await supabase.from("order_items").insert(rows);
  if (itemError) throw itemError;

  return order;
}

export async function updateOrderStatus({ orderId, status }) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderPayment({ orderId, paymentStatus, status }) {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus, status })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToOrder(orderId, callback) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();
}

export async function getAvailableDrivers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("role", "driver")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAvailableLaundromats() {
  const { data, error } = await supabase
    .from("laundromats")
    .select("id, name, address, city")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateOrderDetails({
  orderId,
  driverId,
  laundromat_id,
  status,
}) {
  const updatePayload = {};
  if (driverId !== undefined) updatePayload.driver_id = driverId;
  if (laundromat_id !== undefined) updatePayload.laundromat_id = laundromat_id;
  if (status !== undefined) updatePayload.status = status;

  const { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingDispatchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      customer:customer_id(id, full_name, phone, email),
      order_items(*)`)
    .eq("status", "pending_dispatch")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDriverActiveOrder(driverId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      customer:customer_id(id, full_name, phone, email),
      addresses:pickup_address_id(*),
      laundromats(*),
      order_items(*)`)
    .eq("driver_id", driverId)
    .not("status", "in", ("delivered,cancelled"))
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return error?.code === "PGRST116" ? null : data;
}

export async function getLaundomatOrders(laundromat_id) {
  const laundromatStatuses = [
    "received",
    "sorting",
    "washing",
    "drying",
    "folding",
    "quality_check",
    "packed",
    "ready_for_delivery",
  ];
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      customer:customer_id(id, full_name, phone, email),
      order_items(*)`)
    .eq("laundromat_id", laundromat_id)
    .in("status", laundromatStatuses)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
