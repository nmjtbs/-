export const API_ENDPOINTS = {
  commandCenter: "/api/v1/dashboard/command-center",
  matchLab: (matchId: string) => `/api/v1/dashboard/matches/${matchId}/lab`,
} as const;
