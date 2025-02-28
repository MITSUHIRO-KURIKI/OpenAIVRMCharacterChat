// lib
import axios from 'axios';


// FrontendApiClient
export const FrontendApiClient = axios.create({
  baseURL:         process.env.FRONTEND_API_URL,
  withCredentials: false,
});

// FrontendWithCredentialsApiClient
export const FrontendWithCredentialsApiClient = axios.create({
  baseURL:         process.env.FRONTEND_API_URL,
  withCredentials: true,
});