import type { ReactElement } from 'react';

export default function Head(): ReactElement {
  return (
    <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# website: http://ogp.me/ns/website#">
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    </head>
  );
};