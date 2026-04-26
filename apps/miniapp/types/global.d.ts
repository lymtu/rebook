/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'tt' | 'qq' | 'jd' | 'h5' | 'rn';
    readonly TARO_APP_API_BASE_URL: string;
  }
}
