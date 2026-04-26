import type { UserConfigExport } from '@tarojs/cli';

const config: UserConfigExport = {
  mini: {},
  h5: {
    enableSourceMap: false,
  },
  defineConstants: {
    'process.env.TARO_APP_API_BASE_URL': JSON.stringify(
      process.env.TARO_APP_API_BASE_URL ?? 'https://api.example.com',
    ),
  },
};

export default config;
