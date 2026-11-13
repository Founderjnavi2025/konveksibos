import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405);
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return response({ error: "Silakan login dahulu" }, 401);
    }

    const caller = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } =
      await caller.auth.getUser();

    if (authError || !authData.user) {
      return response({ error: "Session tidak valid" }, 401);
    }

    // Ambil harga dari katalog paket aktif
    const { data: plan, error: planError } = await admin
      .from("pricing_plans")
      .select("code, name, price, duration_days")
      .eq("code", "VIP-30")
      .eq("active", true)
      .maybeSingle();

    if (planError) throw planError;

    if (!plan) {
      return response({ error: "Paket VIP-30 tidak tersedia" }, 404);
    }

    const amount = Number(plan.price);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return response({ error: "Harga paket tidak valid" }, 500);
    }

    const orderId = `VIP-${crypto.randomUUID()}`;

    const { error: insertError } = await admin
      .from("payments")
      .insert({
        user_id: authData.user.id,
        order_id: orderId,
        gross_amount: amount,
        status: "pending",
      });

    if (insertError) throw insertError;

    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(serverKey + ":")}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: amount,
          },
          item_details: [{
            id: plan.code,
            price: amount,
            quantity: 1,
            name: plan.name,
          }],
          customer_details: {
            email: authData.user.email,
          },
        }),
      }
    );

    const result = await midtransResponse.json();

    console.log("MIDTRANS RESPONSE:", result);

    if (!midtransResponse.ok) {
      await admin.from("payments")
        .update({ status: "failed" })
        .eq("order_id", orderId);

      return response({ error: "Midtrans menolak transaksi", detail: result }, 400);
    }

    const { error: updateError } = await admin
      .from("payments")
      .update({ snap_token: result.token })
      .eq("order_id", orderId);

    if (updateError) throw updateError;

    return response({
      success: true,
      order_id: orderId,
      token: result.token,
      redirect_url: result.redirect_url,
    });

  } catch (error) {
    return response({
      error: error instanceof Error ? error.message : "Terjadi kesalahan",
    }, 500);
  }
});
