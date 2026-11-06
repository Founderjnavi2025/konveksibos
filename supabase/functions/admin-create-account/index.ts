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
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return response({ error: "Unauthorized" }, 401);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const caller = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await caller.auth.getUser();
  if (authError || !authData.user) return response({ error: "Session tidak valid" }, 401);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("platform_role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || profile?.platform_role !== "super_admin") {
    return response({ error: "Akses Super Admin diperlukan" }, 403);
  }

  let userId: string | null = null;

  try {
    const body = await req.json();
    const fullName = String(body.full_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const businessName = String(body.business_name || "").trim();

    if (!fullName || !email || !businessName || password.length < 8) {
      return response({ error: "Lengkapi semua data. Password minimal 8 karakter." }, 400);
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) throw createError;
    userId = created.user.id;

    const { error: insertProfileError } = await admin.from("profiles").insert({
      id: userId,
      full_name: fullName,
      platform_role: "user",
    });

    if (insertProfileError) throw insertProfileError;

    const { data: room, error: roomError } = await admin
      .from("rooms")
      .insert({ owner_id: userId, name: businessName, status: "active" })
      .select("id,name")
      .single();

    if (roomError) throw roomError;

    const { error: memberError } = await admin.from("room_members").insert({
      room_id: room.id,
      user_id: userId,
      role: "owner",
    });

    if (memberError) throw memberError;

    return response({
      success: true,
      message: "Akun dan workspace berhasil dibuat.",
      user: { id: userId, email },
      workspace: room,
    });
  } catch (error) {
    if (userId) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
    }
    return response({ error: error.message || "Gagal membuat akun." }, 400);
  }
});
