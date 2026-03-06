/**
 * Configuração centralizada da API.
 * Detecta automaticamente se deve usar localhost ou o IP da rede,
 * ou usa a variável de ambiente VITE_API_URL se definida.
 */
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production, we MUST have VITE_API_URL defined if the frontend and backend 
  // are hosted on different domains. If they are on the same domain, relative path works.
  // By default, it will fall back to an empty string to use relative `/api` paths 
  // (which is handled by Vite proxy in dev, and needs Nginx/Vercel rewrites in prod)
  // Or it can default to the known production backend URL.
  return import.meta.env.PROD
    ? 'https://nexa-backend.up.railway.app' // Example production backend URL, should be changed upon deployment if needed
    : '';
};

export const API_URL = getApiUrl();