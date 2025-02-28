import { v4 as uuidv4 } from 'uuid';

export function generateUUIDHex(): string {
  return uuidv4().replace(/-/g, '');
};