import axios from 'axios';
import { useAppSelector } from '../store';

export function AxiosInterceptor({children}) {
  const auth = useAppSelector(state => state?.auth?.user?.authorization);

  // Add a request interceptor
  axios.interceptors.request.use(function (config) {
    if (auth) {
      config.headers.Authorization =  auth;
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  return children;
}
