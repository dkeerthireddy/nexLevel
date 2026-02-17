import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 max-w-7xl pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
