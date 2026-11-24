import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { appConfig } from './config';

export const userManager = new UserManager({
  authority: appConfig.oidcAuthority,
  client_id: appConfig.oidcClientId,
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: false,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

export async function startLogin(): Promise<void>
{
  await userManager.signinRedirect();
}

let pendingLoginCallback: Promise<void> | null = null;

export function completeLogin(): Promise<void>
{
  if (!pendingLoginCallback)
  {
    pendingLoginCallback = userManager.signinRedirectCallback().then(() =>
    {
      window.history.replaceState(null, '', '/');
    });
  }

  return pendingLoginCallback;
}

export async function startLogout(): Promise<void>
{
  await userManager.signoutRedirect();
}
