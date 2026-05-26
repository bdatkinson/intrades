import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden"
        >
          <Menu />
        </button>
        <h1 className="text-xl font-bold">InTrades</h1>
      </header>

      <div className="flex flex-1">
        <aside 
          className={`${showSidebar ? 'block' : 'hidden'} lg:block w-64 bg-gray-100 p-4`}
        >
          {/* Sidebar navigation */}
        </aside>

        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      <footer className="bg-gray-800 text-white p-4 text-center">
        © {new Date().getFullYear()} InTrades
      </footer>
    </div>
  );
}
