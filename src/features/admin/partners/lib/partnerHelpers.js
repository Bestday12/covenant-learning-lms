/*
|--------------------------------------------------------------------------
| Relationship Status
|--------------------------------------------------------------------------
*/

export function getRelationshipStatus(row) {
  // Check if partner_id exists AND partner_name exists
  if (row.partner_id && row.partner_name) {
    return "linked";
  }
  
  // Check if there's an invite code (pending invite)
  if (row.invite_code && !row.partner_id) {
    return "pending";
  }
  
  return "unlinked";
}

/*
|--------------------------------------------------------------------------
| Initials
|--------------------------------------------------------------------------
*/

export function initials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

export function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

export function filterPartners(rows, search) {
  if (!search) return rows;

  const term = search.toLowerCase();

  return rows.filter((row) => {
    return (
      row.full_name?.toLowerCase().includes(term) ||
      row.email?.toLowerCase().includes(term) ||
      row.partner_name?.toLowerCase().includes(term) ||
      row.partner_email?.toLowerCase().includes(term) ||
      row.invite_code?.toLowerCase().includes(term)
    );
  });
}

/*
|--------------------------------------------------------------------------
| Counts
|--------------------------------------------------------------------------
*/

export function buildPartnerStats(rows) {
  return {
    total: rows.length,
    linked: rows.filter((x) => x.partner_id && x.partner_name).length,
    unlinked: rows.filter((x) => !x.partner_id).length,
    pending: rows.filter((x) => x.invite_code && !x.partner_id).length,
  };
}