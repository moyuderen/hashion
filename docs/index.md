---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Hashion'
  text: ''
  tagline: 分段计算文件hash
  actions:
    - theme: brand
      text: Quick start
      link: /quick-start

features:
  - title: 多种方式
    details: 支持使用spark-md5, 浏览器原生crypto.subtle.digest, Web Worker内联
  - title: 分段增量计算
    details: 可以支持大文件的hash计算
  - title: 中断取消
    details: 支持中断取消计算过程
---
