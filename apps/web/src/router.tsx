import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/app-layout';
import { AdminLayout } from '@/components/admin-layout';

export const router = createBrowserRouter([
  { path: '/login', lazy: () => import('@/pages/login') },
  { path: '/register', lazy: () => import('@/pages/register') },
  {
    element: <AppLayout />,
    children: [
      { path: '/', lazy: () => import('@/pages/home') },
      { path: '/books', element: <Navigate to="/categories" replace /> },
      { path: '/categories', lazy: () => import('@/pages/categories') },
      { path: '/messages', lazy: () => import('@/pages/messages') },
      { path: '/books/:id/edit', lazy: () => import('@/pages/book-edit') },
      { path: '/books/:id', lazy: () => import('@/pages/book-detail') },
      { path: '/cart', lazy: () => import('@/pages/cart') },
      { path: '/orders', lazy: () => import('@/pages/orders') },
      { path: '/orders/:id', lazy: () => import('@/pages/order-detail') },
      { path: '/sell', lazy: () => import('@/pages/sell') },
      { path: '/my-books', lazy: () => import('@/pages/my-books') },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/pending-books" replace /> },
      { path: 'pending-books', lazy: () => import('@/pages/admin-pending-books') },
      { path: 'disputes', lazy: () => import('@/pages/admin-disputes-placeholder') },
      { path: 'users', lazy: () => import('@/pages/admin-users-placeholder') },
      { path: 'fee', lazy: () => import('@/pages/admin-fee-placeholder') },
      { path: 'announcements', lazy: () => import('@/pages/admin-announce-placeholder') },
    ],
  },
]);
