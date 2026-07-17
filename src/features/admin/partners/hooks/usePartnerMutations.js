// src/features/admin/partners/hooks/usePartnerMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlinkPartners } from "../api/partnersApi";
import { partnerKeys } from "../lib/partnerQueryKeys";

export function useUnlinkPartners() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, partnerId }) =>
      unlinkPartners(userId, partnerId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: partnerKeys.all,
      });
    },
  });
}