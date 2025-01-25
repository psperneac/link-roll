import { AppState } from '../store';

export const getOptions = (getState) => {
  const state = getState() as any as AppState;
  return {
    headers: {
      Authorization: state.auth.user.authorization,
    },
  };
}
