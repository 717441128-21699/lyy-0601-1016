import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ActivityListPage from '@/pages/activity-list';
import ActivityEditPage from '@/pages/activity-edit';
import ProductSelectPage from '@/pages/product-select';
import StoreScopePage from '@/pages/store-scope';
import EffectAnalysisPage from '@/pages/effect-analysis';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/activity/list" replace />,
      },
      {
        path: '/activity/list',
        element: <ActivityListPage />,
      },
      {
        path: '/activity/create',
        element: <ActivityEditPage />,
      },
      {
        path: '/activity/edit/:id',
        element: <ActivityEditPage />,
      },
      {
        path: '/activity/:id/products',
        element: <ProductSelectPage />,
      },
      {
        path: '/activity/:id/stores',
        element: <StoreScopePage />,
      },
      {
        path: '/activity/analysis',
        element: <EffectAnalysisPage />,
      },
      {
        path: '/activity/:id/analysis',
        element: <EffectAnalysisPage />,
      },
    ],
  },
]);

export default router;
