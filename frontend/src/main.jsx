import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import App from './App.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import CommunitiesPage from './pages/CommunitiesPage.jsx'
import CommunityDetailPage from './pages/CommunityDetailPage.jsx'
import TopicDetailPage from './pages/TopicDetailPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './components/MainLayout.jsx'
import './styles/global.css'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'perfil/:id',
        element: <ProfilePage />,
      },
      {
        path: 'amigos',
        element: <FriendsPage />,
      },
      {
        path: 'comunidades',
        element: <CommunitiesPage />,
      },
      {
        path: 'comunidades/:id',
        element: <CommunityDetailPage />,
      },
      {
        path: 'comunidades/:communityId/topicos/:topicId',
        element: <TopicDetailPage />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
