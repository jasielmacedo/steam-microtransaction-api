import { apiSlice } from './apiSlice';

export const exportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Export Steam itemdef.json
    exportSteamItemdef: builder.query<void, { gameId?: string }>({
      query: ({ gameId }) => {
        // Build the URL with query params if needed
        let url = '/admin/export/steam/itemdef';
        if (gameId) {
          url += `?game_id=${gameId}`;
        }
        return {
          url,
          responseHandler: async (response) => {
            // Extract filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'itemdef.json';
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch) {
                filename = filenameMatch[1];
              }
            }

            // Get the response as blob
            const blob = await response.blob();
            
            // Create a download link and trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          },
        };
      },
    }),
  }),
});

export const { useLazyExportSteamItemdefQuery } = exportApi;