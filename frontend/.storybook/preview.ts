import { type Preview } from "@storybook/react";
import { withThemeByDataAttribute } from '@storybook/addon-themes';

import '@/styles/base/globals.css';
import './storybook.css';

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark:  'dark',
    },
    defaultTheme:  'light',
    attributeName: 'data-bs-theme',
  }),
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
  },
};

export default preview;
