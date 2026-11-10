import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function sha512(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-512", data);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return response({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey);

    const notification = await req.json();

    if (!notification || typeof notification !== "object") {
      console.error("Invalid JSON payload");
      return response({ error: "Invalid JSON payload" }, 400);
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
    } = notification;

    console.log("MIDTRANS WEBHOOK RECEIVED:", {
      keys: Object.keys(notification),
      order_id,
      status_code,
      gross_amount,
      gross_amount_type: typeof gross_amount,
      signature_present: Boolean(signature_key),
    });

    if (
      !order_id ||
      !status_code ||
      gross_amount === undefined ||
      gross_amount === null ||
      !signature_key
    ) {
      console.error("Missing required notification fields");
      return response({ error: "Invalid notification" }, 400);
    }

    const expectedSignature = await sha512(
      String(order_id) +
      String(status_code) +
      String(gross_amount) +
      serverKey
    );

    const signatureValid = expectedSignature === signature_key;

    console.log("MIDTRANS SIGNATURE CHECK:", {
      valid: signatureValid,
      order_id,
      status_code,
      gross_amount,
    });

    if (!signatureValid) {
      console.error("Midtrans signature mismatch");
      return response({ error: "Invalid signature" }, 401);
    }

    const auth = btoa(serverKey + ":");

    const midtransResponse = await fetch(
      `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(order_id)}/status`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    if (!midtransResponse.ok) {
      console.error(
        "Midtrans status check failed:",
        midtransResponse.status
      );
      return response({ error: "Unable to verify transaction" }, 502);
    }

    const transaction = await midtransResponse.json();

    // Ambil nominal transaksi asli dari database
    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("user_id, gross_amount, status")
      .eq("order_id", order_id)
      .maybeSingle();

    if (paymentError) throw paymentError;

    if (!payment) {
      return response({ error: "Payment record not found" }, 404);
    }

    const expectedAmount = Number(payment.gross_amount);
    const notificationAmount = Number(gross_amount);
    const transactionAmount = Number(transaction.gross_amount);

    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0 ||
      notificationAmount !== expectedAmount ||
      transaction.order_id !== order_id ||
      transactionAmount !== expectedAmount
    ) {
      console.error("Transaction amount mismatch:", {
        order_id,
        expectedAmount,
        notificationAmount,
        transactionAmount,
      });

      return response({ error: "Transaction mismatch" }, 400);
    }

    if (payment.status !== "pending" && payment.status !== "paid") {
      return response({ error: "Payment is not pending" }, 409);
    }

    const isPaid =
      transaction.transaction_status === "settlement" ||
      (
        transaction.transaction_status === "capture" &&
        transaction.fraud_status === "accept"
      );

    if (!isPaid) {
      return response({
        success: true,
        message: "Payment not completed",
        status: transaction.transaction_status,
      });
    }

    if (payment.status === "paid") {
      return response({ success: true, message: "Already processed" });
    }

    const { data, error } = await admin.rpc("activate_vip_payment", {
      p_order_id: order_id,
      p_transaction_id: transaction.transaction_id,
      p_paid_at: transaction.transaction_time || new Date().toISOString(),
    });

    if (error) throw error;

    return response({
      success: true,
      activated: data === true,
    });

  } catch (error) {
    console.error("Webhook error:", error);

    return response({
      error: error instanceof Error ? error.message : "Internal error",
    }, 500);
  }
});
