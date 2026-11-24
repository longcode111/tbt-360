export const appConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080',
  oidcAuthority:
    import.meta.env.VITE_OIDC_AUTHORITY ??
    'http://localhost:8080/realms/tbt-360',
  oidcClientId: import.meta.env.VITE_OIDC_CLIENT_ID ?? 'tbt-web',
};
