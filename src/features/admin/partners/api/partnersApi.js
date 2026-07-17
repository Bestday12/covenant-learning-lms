import { supabase } from "@/lib/supabase.js";

const VIEW = "partner_relationships";

/*
|--------------------------------------------------------------------------
| Get All Partner Relationships
|--------------------------------------------------------------------------
*/

export async function fetchPartners() {
  const { data, error } = await supabase
    .from(VIEW)
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Get One Relationship
|--------------------------------------------------------------------------
*/

export async function fetchPartner(id) {
  const { data, error } = await supabase
    .from(VIEW)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

/*
|--------------------------------------------------------------------------
| Update Invite Code
|--------------------------------------------------------------------------
*/

export async function updateInviteCode(id, inviteCode) {
  const { error } = await supabase
    .from("profiles")
    .update({
      invite_code: inviteCode,
    })
    .eq("id", id);

  if (error) throw error;

  return true;
}

/*
|--------------------------------------------------------------------------
| Link Two Partners
|--------------------------------------------------------------------------
*/

export async function linkPartners(userId, partnerId) {
  const { error } = await supabase
    .from("profiles")
    .update({
      partner_id: partnerId,
    })
    .eq("id", userId);

  if (error) throw error;

  const { error: reverseError } = await supabase
    .from("profiles")
    .update({
      partner_id: userId,
    })
    .eq("id", partnerId);

  if (reverseError) throw reverseError;

  return true;
}

/*
|--------------------------------------------------------------------------
| Remove Relationship
|--------------------------------------------------------------------------
*/

export async function unlinkPartners(userId, partnerId) {
  const { error } = await supabase
    .from("profiles")
    .update({
      partner_id: null,
    })
    .in("id", [userId, partnerId]);

  if (error) throw error;

  return true;
}