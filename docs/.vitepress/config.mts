import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Hashion',
  description: '计算文件hash,',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'Home', link: '/' }],

    sidebar: [],

    socialLinks: [{ icon: 'github', link: 'https://github.com/moyuderen/hashion' }]
  }
})
