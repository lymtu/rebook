import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnnouncementDTO, CreateAnnouncementInput } from '@rebook/shared';
import { api } from '@/lib/api';

export const announcementKeys = {
  all: ['announcements'] as const,
};

export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.all,
    queryFn: () => api.get<AnnouncementDTO[]>('/announcements'),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) => api.post<AnnouncementDTO>('/announcements', input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: announcementKeys.all }),
  });
}
