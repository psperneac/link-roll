import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import {HEADER_AUTH} from '../constants/constants';
import { history } from '../helpers';

export const TAG = {
  ITEM: 'Item',
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_APP_API_URL,
  prepareHeaders: (headers, {getState}) => {
    const state: any = getState();
    headers.set(HEADER_AUTH, state?.auth?.user?.authorization);
  }
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    history.navigate('/login');
  }

  return result;
};


export const DataApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [TAG.ITEM],
  endpoints: (build) => ({
  }),
});

// Auto-generated hooks
export const {
  endpoints,
  reducerPath,
  reducer,
  middleware
} = DataApi;
