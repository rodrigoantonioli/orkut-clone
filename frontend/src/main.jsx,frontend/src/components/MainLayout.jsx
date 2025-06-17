import FriendsPage from './pages/FriendsPage.jsx';
import CommunitiesPage from './pages/CommunitiesPage.jsx';
import CommunityDetailPage from './pages/CommunityDetailPage.jsx';

const routes = [
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
]; 