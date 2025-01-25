import { combineReducers, configureStore, createDraftSafeSelector } from '@reduxjs/toolkit';

import { alertReducer } from './alert.slice';
import { authReducer } from './auth.slice';
import { itemsReducer } from './item.slice';

import * as apiSlice from './data.api';
import { useDispatch, useSelector } from 'react-redux';

export * from './alert.slice';
export * from './auth.slice';
export * from './item.slice';

const combinedReducer = combineReducers({
  alert: alertReducer,
  auth: authReducer,
  items: itemsReducer,
  api: apiSlice.reducer
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined
  }
  return combinedReducer(state, action);
}

export const store = configureStore({
  reducer: rootReducer,
  devTools: (__DEV__),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware as any),
});

export type AppState = ReturnType<typeof store.getState>;
export type GetState = () => AppState;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppState>();
export const useAppDraftSafeSelector = createDraftSafeSelector.withTypes<AppState>();
