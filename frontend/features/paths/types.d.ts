// UrlQuery
export type UrlQuery = {
  next?:   string;
  errmsg?: string;
} & Record<string, string>;

export type UrlConfig = {
  query?: UrlQuery;
  hash?:  string;
};