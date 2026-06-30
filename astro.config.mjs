// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://taiyakikuroann.github.io',
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  }
});
