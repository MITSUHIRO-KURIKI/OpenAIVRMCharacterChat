import { zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

// zxcvbnOptions
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs:       zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};
export function setupZxcvbnOptions() {
  zxcvbnOptions.setOptions(options);
};

// getZxcvbnStrengthLabel
export function getZxcvbnStrengthLabel(score: number) {
  switch (score) {
    case 0: return 'low';
    case 1: return 'low';
    case 2: return 'mid';
    case 3: return 'high';
    case 4: return 'high';
    default: return '';
  };
};