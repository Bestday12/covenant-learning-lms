import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchPartners,
  fetchPartner,
  updateInviteCode,
  linkPartners,
  unlinkPartners,
} from "../api/partnersApi";

import { partnerKeys } from "../lib/partnerQueryKeys";

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export function usePartners() {
  return useQuery({
    queryKey: partnerKeys.all,
    queryFn: fetchPartners,
  });
}

/*
|--------------------------------------------------------------------------
| Single
|--------------------------------------------------------------------------
*/

export function usePartner(id) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => fetchPartner(id),
    enabled: !!id,
  });
}

/*
|--------------------------------------------------------------------------
| Update Invite
|--------------------------------------------------------------------------
*/

export function useUpdateInviteCode() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, inviteCode }) =>
      updateInviteCode(id, inviteCode),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: partnerKeys.all,
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Link
|--------------------------------------------------------------------------
*/

export function useLinkPartners() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, partnerId }) =>
      linkPartners(userId, partnerId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: partnerKeys.all,
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Remove
|--------------------------------------------------------------------------
*/

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