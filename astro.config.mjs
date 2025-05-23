// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import UnoCSS from 'unocss/astro'
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: "https://semicoder.dev",
  integrations: [react(), UnoCSS(), mdx()]
});