// import
import { authPath } from './auth';

export const apiPath = {
  // auth
  authPath: authPath,
} as const;
  
// prettier-ignore
export type ApiPath = typeof apiPath;