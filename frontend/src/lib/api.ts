import { appConfig } from './config';
import { userManager } from './auth';

export class ApiError extends Error
{
  public readonly status: number;

  public constructor(message: string, status: number)
  {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<ResponseType>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ResponseType>
{
  const currentUser = await userManager.getUser();
  const headers = new Headers(options.headers);

  if (options.body !== undefined)
  {
    headers.set('Content-Type', 'application/json');
  }

  if (currentUser?.access_token && !currentUser.expired)
  {
    headers.set('Authorization', `Bearer ${currentUser.access_token}`);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok)
  {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Có lỗi xảy ra.', response.status);
  }

  if (response.status === 204)
  {
    return undefined as ResponseType;
  }

  return response.json() as Promise<ResponseType>;
}
