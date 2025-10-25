import { useCallback } from 'react';

import { useJwtContext, useVincentWebAuthClient } from '@lit-protocol/vincent-app-sdk/react';

import { env } from '@/config/env';

const { VITE_APP_ID, VITE_BACKEND_URL, VITE_REDIRECT_URI } = env;

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type Guard = {
  lastRunAt: string;
  nextRunAt: string;
  lastFinishedAt: string;
  failedAt: string;
  _id: string;
  disabled: boolean;
  failReason: string;
  data: {
    name: string;
    repayAmount: number;
    triggerPrice: string;
    vincentAppVersion: number;
    pkpInfo: {
      ethAddress: string;
      publicKey: string;
      tokenId: string;
    };
    updatedAt: string;
  };
};

export interface createGuardRequest {
  name: string;
  repayAmount: string;
  triggerPrice: string;
}

export type HealthFactorResponse = {
  healthFactor: number;
};

export const useBackend = () => {
  const { authInfo } = useJwtContext();
  const vincentWebAuthClient = useVincentWebAuthClient(VITE_APP_ID);

  const getJwt = useCallback(() => {
    // Redirect to Vincent Auth consent page with appId and version
    vincentWebAuthClient.redirectToConnectPage({
      // consentPageUrl: `http://localhost:3000/`,
      redirectUri: VITE_REDIRECT_URI,
    });
  }, [vincentWebAuthClient]);

  const sendRequest = useCallback(
    async <T>(endpoint: string, method: HTTPMethod, body?: unknown): Promise<T> => {
      if (!authInfo?.jwt) {
        throw new Error('No JWT to query backend');
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${authInfo.jwt}`,
      };
      if (body != null) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${VITE_BACKEND_URL}${endpoint}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = (await response.json()) as { data: T; success: boolean };

      if (!json.success) {
        throw new Error(`Backend error: ${json.data}`);
      }

      return json.data;
    },
    [authInfo]
  );

  const createGuard = useCallback(
    async (guard: createGuardRequest) => {
      return sendRequest<Guard>('/schedule', 'POST', guard);
    },
    [sendRequest]
  );

  const getGuards = useCallback(async () => {
    return sendRequest<Guard[]>('/schedules', 'GET');
  }, [sendRequest]);

  const disableGuard = useCallback(
    async (scheduleId: string) => {
      return sendRequest<Guard>(`/schedules/${scheduleId}/disable`, 'PUT');
    },
    [sendRequest]
  );

  const enableGuard = useCallback(
    async (scheduleId: string) => {
      return sendRequest<Guard>(`/schedules/${scheduleId}/enable`, 'PUT');
    },
    [sendRequest]
  );

  const editGuard = useCallback(
    async (scheduleId: string, guard: createGuardRequest) => {
      return sendRequest<Guard>(`/schedules/${scheduleId}`, 'PUT', guard);
    },
    [sendRequest]
  );

  const deleteGuard = useCallback(
    async (scheduleId: string) => {
      return sendRequest<Guard>(`/schedules/${scheduleId}`, 'DELETE');
    },
    [sendRequest]
  );

  const getHealthFactor = useCallback(
    async (userAddress: string) => {
      return sendRequest<number>('/health-factor', 'POST', { userAddress });
    },
    [sendRequest]
  );

  return {
    createGuard,
    deleteGuard,
    disableGuard,
    editGuard,
    enableGuard,
    getGuards,
    getHealthFactor,
    getJwt,
  };
};
