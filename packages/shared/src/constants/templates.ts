import { Template } from '../types/template';

export const TEMPLATES: Record<string, Template> = {
  soccer: {
    id: 'soccer',
    name: 'サッカー',
    type: 'soccer',
    itemCount: 11,
    animationType: 'slide-formation',
  },
  baseball: {
    id: 'baseball',
    name: '野球',
    type: 'baseball',
    itemCount: 9,
    animationType: 'diamond-lineup',
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);