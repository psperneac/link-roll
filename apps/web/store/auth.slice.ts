import { UserWithAuthenticationDto, RegisterUserDto } from '@/models';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

import { alertActions } from './alert.slice';
import { history } from '../helpers';
import { AppState } from './index';

export interface AuthState {
  user: UserWithAuthenticationDto;
  loading: boolean;
  error: any;
}

const initialState: AuthState = {
  user: undefined,
  loading: undefined,
  error: undefined,
};

const baseUrl = process.env.EXPO_PUBLIC_APP_API_URL + '/authentication';

export const authApi = {
  login: (email: string, password: string) => {
    return axios.post(`${baseUrl}/login`, { email, password });
  },
  logout: (auth) => {
    return axios.post(`${baseUrl}/logout`, {
      headers: {
        'Authorization': `Bearer ${auth}`,
      },
    });
  },
  register: (username, password, passwordConfirm, email, firstName, lastName) => {
    return axios.post(`${baseUrl}/register`,
      {
        username,
        password,
        passwordConfirm,
        email,
        firstName,
        lastName
      }
    );
  }
};

const name = 'auth';
const slice = createSlice({
  initialState,
  name,
  reducers: {
    authLogin(state, { payload }: PayloadAction<{ username: string, password: string }>) {
      state.loading = true;
      state.error = undefined;
    },
    authLoginSuccess(state, { payload }: PayloadAction<UserWithAuthenticationDto>) {
      state.user = payload;
      state.loading = false;
      state.error = undefined;
    },
    authLoginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    authLogout(state) {
      state.loading = true;
      state.error = undefined;
    },
    authLogoutSuccess(state) {
      state.user = undefined;
      state.loading = false;
      state.error = undefined;
    },
    authLogoutFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    authRegister(state, { payload }: PayloadAction<RegisterUserDto>) {
      state.loading = true;
      state.error = undefined;
    },
    authRegisterSuccess(state, { payload }: PayloadAction<UserWithAuthenticationDto>) {
      state.loading = false;
      state.error = undefined;
    },
    authRegisterFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

const { actions, reducer } = slice;

function handleError(dispatch, error) {
  dispatch(alertActions.error(error));

  if (Array.isArray((error as any).response.data.error)) {
    (error as []).forEach((el: any) =>
      toast.error(el.message, { position: 'top-right' })
    );
  } else {
    toast.error(error, {
      position: 'top-right'
    });
    throw error;
  }
}

export const doLogin = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string, password: string }, { dispatch }) => {
    dispatch(actions.authLogin({ username: email, password }));

    authApi.login(email, password)
      .then((response) => {
        if (response.data) {
          dispatch({ type: 'RESET' });
          dispatch(actions.authLoginSuccess(response.data));
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('auth', JSON.stringify(response.data));
          const { from } = history.location?.state || { from: { pathname: '/' } };
          if (history && history.navigate) {
            history.navigate(from);
          }
        } else {
          dispatch(actions.authLoginFailure("No data returned"));
          dispatch(alertActions.error('No data returned' as any));
        }
      })
      .catch((error) => {
        dispatch(actions.authLoginFailure(error));
        handleError(dispatch, error);
      });
  }

);

export const doLogout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, getState }) => {
    const state = getState() as any as AppState;
    dispatch(actions.authLogout());
    authApi.logout(state.auth.user.authorization)
      .then(() => {
        dispatch(actions.authLogoutSuccess());
        dispatch({ type: 'RESET' });
        localStorage.removeItem('auth');
        history.navigate('/login');
      })
      .catch((error) => {
        dispatch(actions.authLogoutFailure(error));
        handleError(dispatch, error);
      });
  }
);

export const doRegister = createAsyncThunk(
  'auth/register',
  async (payload: RegisterUserDto, { dispatch }) => {
    dispatch(actions.authRegister(payload));
    authApi.register(payload.username, payload.password, payload.passwordConfirm, payload.email, payload.firstName, payload.lastName)
      .then((response) => {
        if (response.data) {
          dispatch(actions.authRegisterSuccess(response.data));
          toast.success('Register success: ' + response.data.username);
          history.navigate('/login');
        } else {
          dispatch(actions.authRegisterFailure("No data returned"));
          dispatch(alertActions.error('No data returned' as any));
        }
      })
      .catch((error) => {
        dispatch(actions.authRegisterFailure(error));
        handleError(dispatch, error);
      });
  }
);

export const authActions = { ...actions, doLogin, doLogout, doRegister };
export const authReducer = reducer;
