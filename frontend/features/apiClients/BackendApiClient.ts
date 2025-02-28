// lib
import axios from 'axios';


// BackendApiClient
export const BackendApiClient = axios.create({
  baseURL:         process.env.BACKEND_API_URL,
  withCredentials: false,
});

// BackendWithCredentialsApiClient
export const BackendWithCredentialsApiClient = axios.create({
  baseURL:         process.env.BACKEND_API_URL,
  withCredentials: true,
});