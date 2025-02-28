// types
type RouteObj = {
  pathname: string;
  query?:   Record<string, string>;
  hash?:    string;
};


// UrlToString
export function UrlToString(routeObj: RouteObj): string {

  let strPath = routeObj.pathname;

  if (routeObj.query) {
    const qs = new URLSearchParams(routeObj.query);
    const queryString = qs.toString();
    if (queryString) {
      strPath += `?${queryString}`;
    };
  };

  if (routeObj.hash) {
    strPath += `#${routeObj.hash}`;
  };

  return strPath;
};