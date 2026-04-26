import type { UserConfigExport } from '@tarojs/cli';

const config: UserConfigExport = {
  logger: { quiet: false, stats: true },
  mini: {},
  h5: {},
  defineConstants: {
    'process.env.TARO_APP_API_BASE_URL': JSON.stringify(
      process.env.TARO_APP_API_BASE_URL ?? 'http://localhost:3000',
    ),
  },
};

export default config;
