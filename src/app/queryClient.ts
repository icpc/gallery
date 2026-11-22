import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { apiKey, UNIQUE_CONTEST_KEY } from "@/config/gallery";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
      refetchOnWindowFocus: false,
    },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: `icpc-gallery-query+${apiKey}+${UNIQUE_CONTEST_KEY}`,
});
