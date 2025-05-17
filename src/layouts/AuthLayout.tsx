import React from 'react';
import { Outlet } from 'react-router-dom';
import { PenLine } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      {/* Header with logo */}
      <header className="py-4 px-6 sm:px-10 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PenLine className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-semibold text-primary-600">SignSecure</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} SignSecure. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;