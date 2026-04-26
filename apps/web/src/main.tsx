import 'antd/dist/reset.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { router } from './router';
import { queryClient } from './lib/queryClient';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#2D6B3F',
            colorLink: '#2D6B3F',
            colorLinkHover: '#245a34',
            colorText: '#1E3322',
            colorTextSecondary: '#6B7B6B',
            colorTextTertiary: '#8A9190',
            colorBorder: '#D4CEC2',
            colorBorderSecondary: '#E8E3D8',
            borderRadius: 6,
            fontFamily:
              'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
          },
          components: {
            Layout: {
              headerBg: '#FAFAF7',
              bodyBg: '#E4DDD2',
              footerBg: '#E4DDD2',
            },
            Button: {
              primaryShadow: 'none',
              contentFontSizeLG: 15,
              paddingInlineLG: 20,
            },
            Spin: {
              colorPrimary: '#2D6B3F',
            },
            List: {
              colorSplit: '#E5E0D6',
            },
          },
        }}
      >
        <App className="min-h-full">
          <RouterProvider router={router} />
        </App>
      </ConfigProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
