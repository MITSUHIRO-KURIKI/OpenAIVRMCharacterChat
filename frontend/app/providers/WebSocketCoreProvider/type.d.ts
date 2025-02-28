// ClientMessage
export type ClientMessage = {
  cmd:                     string;
  request_user_access_id?: string;
  [key: string]:           unknown;
  data?: {
    [key: string]: unknown;
  };
};
// ServerMessage
export type ServerMessage = {
  cmd:      string;
  status:   number;
  ok:       boolean;
  message?: string | null;
  data?: {
    [key: string]: unknown;
  };
};

// BrotliWasm
export type BrotliWasm = {
  compress: (
    input:    Uint8Array,
    options?: Record<string, unknown>
  ) => Uint8Array;
  decompress: (input: Uint8Array) => Uint8Array;
};