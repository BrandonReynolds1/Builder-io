import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

/**
 * Initialize or return an existing Supabase client.
 * Requires SUPABASE_URL and SUPABASE_KEY environment variables to be set.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_KEY environment variables for Supabase client"
    );
  }

  // createClient options: do not persist sessions in server-side contexts
  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabase;
}

/**
 * Simple helper to fetch rows from a `demo` table (if present).
 * This is intentionally generic/limited — adapt table names and shapes as needed.
 */
export async function fetchDemoRows(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("demo").select("*").limit(50);
  if (error) throw error;
  return data ?? [];
}

/**
 * Insert a row into `demo` table. Returns the inserted rows array.
 */
export async function insertDemoRow(payload: Record<string, unknown>): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("demo").insert([payload]);
  if (error) throw error;
  return data ?? [];
}

// Generic helpers for application configuration tables
export async function fetchRoles(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("roles").select("*").order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPriorities(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("priorities").select("*").order("weight", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRegistrationOptions(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("registration_options").select("*").order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchQuestions(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("questions").select("*").order("\"order\"", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Users and sponsor helpers
export async function fetchUsers(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data: users, error } = await sb.from("users").select("*");
  if (error) throw error;
  const rolesRes = await sb.from("roles").select("id,name");
  const roles = rolesRes.data ?? [];

  // fetch sponsor backgrounds to enrich user records
  const sbBg = await sb.from("sponsor_backgrounds").select("*");
  const bgs = sbBg.data ?? [];

  // map users to include displayName, role name and vetted
  return (users ?? []).map((u: any) => {
    const role = roles.find((r: any) => r.id === u.role_id);
    const bg = (bgs as any[]).find((b) => b.sponsor_user_id === u.id);
    return {
      id: u.id,
      email: u.email,
      displayName: u.full_name || (u.profile && u.profile.displayName) || u.email,
      role: role ? role.name : null,
      vetted: bg ? bg.verified : false,
      qualifications: bg ? bg.qualifications : undefined,
      yearsOfExperience: bg ? (bg.qualifications ? bg.qualifications.length : undefined) : undefined,
      metadata: u.metadata,
    };
  });
}

export async function approveSponsor(userId: string): Promise<void> {
  const sb = getSupabaseClient();
  // ensure sponsor_backgrounds row exists
  const { data: existing } = await sb.from("sponsor_backgrounds").select("*").eq("sponsor_user_id", userId).limit(1);
  if (existing && existing.length > 0) {
    await sb.from("sponsor_backgrounds").update({ verified: true }).eq("sponsor_user_id", userId);
  } else {
    await sb.from("sponsor_backgrounds").insert([{ sponsor_user_id: userId, verified: true }]);
  }
}

export async function declineSponsor(userId: string): Promise<void> {
  const sb = getSupabaseClient();
  // mark as not verified and ensure role is user (if roles table exists)
  await sb.from("sponsor_backgrounds").update({ verified: false }).eq("sponsor_user_id", userId);
  // Optionally downgrade role: find user role id for 'user'
  const rolesRes = await sb.from("roles").select("id,name").eq("name", "user").limit(1);
  if (rolesRes.data && rolesRes.data.length > 0) {
    const userRoleId = rolesRes.data[0].id;
    await sb.from("users").update({ role_id: userRoleId }).eq("id", userId);
  }
}

export async function bulkApproveSponsors(ids: string[]): Promise<void> {
  const sb = getSupabaseClient();
  for (const id of ids) {
    await approveSponsor(id);
  }
}

// Connections helpers
export async function fetchIncomingRequestsForSponsor(sponsorId: string): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("connections").select("*").eq("sponsor_id", sponsorId).eq("status", "pending");
  if (error) throw error;
  return data ?? [];
}

export async function addConnectionRequest(userId: string, sponsorId: string): Promise<any> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("connections").insert([{ user_id: userId, sponsor_id: sponsorId, status: "pending" }]);
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function acceptConnection(userId: string, sponsorId: string): Promise<void> {
  const sb = getSupabaseClient();
  await sb.from("connections").update({ status: "accepted" }).eq("user_id", userId).eq("sponsor_id", sponsorId);
}

export async function declineConnection(userId: string, sponsorId: string): Promise<void> {
  const sb = getSupabaseClient();
  await sb.from("connections").delete().eq("user_id", userId).eq("sponsor_id", sponsorId);
}

// Messages helpers
export async function fetchMessagesForUser(userId: string): Promise<any[]> {
  const sb = getSupabaseClient();
  // If the caller provided a non-UUID id (for example a client-side dev id like "user_123")
  // avoid passing it straight to PostgREST which would attempt to cast to UUID and fail
  // with a 22P02 error. Instead, return an empty list and log the mismatch so the
  // client can fall back to localStorage behavior.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn(`fetchMessagesForUser: requested messages for non-UUID id: ${userId}`);
    return [];
  }

  // Fetch messages with user details
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order("sent_at", { ascending: true });
  
  if (error) {
    console.error('[fetchMessagesForUser] error:', error);
    throw error;
  }
  
  // Fetch all unique user IDs from messages to get names in one query
  const messages = data ?? [];
  const userIds = new Set<string>();
  messages.forEach((msg: any) => {
    if (msg.from_user_id) userIds.add(msg.from_user_id);
    if (msg.to_user_id) userIds.add(msg.to_user_id);
  });
  
  // Fetch user details for all involved users
  const userMap = new Map<string, any>();
  if (userIds.size > 0) {
    const { data: users } = await sb
      .from('users')
      .select('id, full_name, email')
      .in('id', Array.from(userIds));
    
    (users ?? []).forEach((u: any) => {
      userMap.set(u.id, u);
    });
  }
  
  // Transform to include user names directly for easier client consumption
  return messages.map((msg: any) => {
    const fromUser = userMap.get(msg.from_user_id);
    const toUser = userMap.get(msg.to_user_id);
    return {
      ...msg,
      from_user_name: fromUser?.full_name || fromUser?.email || 'Unknown',
      to_user_name: toUser?.full_name || toUser?.email || 'Unknown',
    };
  });
}

export async function insertMessage(fromUserId: string, toUserId: string, body: string): Promise<any> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("messages").insert([{ from_user_id: fromUserId, to_user_id: toUserId, body }]);
  if (error) throw error;
  return (data && data[0]) || null;
}

// Upsert a user record into the users table. Accepts id (optional), email, full_name and metadata.
export async function upsertUser(payload: { id?: string; email: string; full_name?: string; metadata?: any } ) {
  const sb = getSupabaseClient();
  const record: any = { email: payload.email };
  // If caller provided an id ensure it's a valid UUID before including it.
  // Our DB users.id is a UUID; client-side dev ids like `user_123` are not valid and
  // will cause Postgres type errors. Only include id when it's a UUID.
  if (payload.id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(payload.id)) {
      record.id = payload.id;
    }
  }
  if (payload.full_name) record.full_name = payload.full_name;
  if (payload.metadata) record.metadata = payload.metadata;

  // If metadata.role is provided, lookup the role_id and assign it
  if (payload.metadata && payload.metadata.role) {
    try {
      const roleName = payload.metadata.role;
      const rolesRes = await sb.from('roles').select('id').eq('name', roleName).limit(1);
      if (rolesRes.data && rolesRes.data.length > 0) {
        record.role_id = rolesRes.data[0].id;
      }
    } catch (err) {
      console.warn(`[upsertUser] failed to lookup role: ${payload.metadata.role}`, err);
    }
  }

  // Upsert by email to avoid duplicates
  // supabase-js expects onConflict as a string (column name) when using upsert
  const { data, error } = await sb.from('users').upsert(record, { onConflict: 'email' }).select();
  if (error) throw error;
  // Log the DB-assigned id along with input id (if any) to help diagnose id transformations
  const dbUser = (data && data[0]) || null;
  if (dbUser) {
    console.info(`[upsertUser] ok: ${dbUser.id} (input: ${payload.id || 'none'}), email: ${dbUser.email}`);
  }
  return dbUser;
}
