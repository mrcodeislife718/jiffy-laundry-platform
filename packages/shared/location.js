import { supabase } from "./supabase";

export async function insertDriverLocation({
  driverId,
  orderId,
  latitude,
  longitude,
}) {
  const { data, error } = await supabase
    .from("driver_locations")
    .insert({
      driver_id: driverId,
      order_id: orderId,
      latitude,
      longitude,
    });
  if (error) throw error;
  return data;
}

export async function getLatestDriverLocation(orderId) {
  const { data, error } = await supabase
    .from("driver_locations")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return error?.code === "PGRST116" ? null : data;
}

export function subscribeToDriverLocation(orderId, callback) {
  return supabase
    .channel(`driver-location-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "driver_locations",
        filter: `order_id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();
}
