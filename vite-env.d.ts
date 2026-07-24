/// <reference types="vite/client" />

// 1. 声明 .vue 文件模块（解决找不到 .vue 声明的问题）
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 2. 声明所有 .css 文件模块（解决 element-plus css 导入报错的问题）
declare module '*.css';

// 3. 声明具体的 element-plus css 路径（双重保险）
declare module 'element-plus/dist/index.css';
