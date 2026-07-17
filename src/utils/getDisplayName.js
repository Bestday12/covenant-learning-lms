export function getDisplayName(user, profile) {
  const candidates = [
    profile?.full_name,
    profile?.display_name,
    user?.user_metadata?.full_name,
    user?.user_metadata?.display_name,
    user?.user_metadata?.name,
    user?.email,
  ];

  const value = candidates.find(
    (item) => typeof item === "string" && item.trim().length > 0
  );

  return value?.trim() || "Valued Student";
}