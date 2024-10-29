import './assets/main.css';

import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import { routes } from './router';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.use(PrimeVue, {
    theme: {
      preset: MyPreset,
    },
  });
});
