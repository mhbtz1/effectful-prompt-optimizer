import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { MessageSquare, Sparkles, ToggleLeft, Bot } from 'lucide-react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Effectful Agent Optimizer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/chat"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                activeProps={{ className: 'text-blue-600 hover:text-blue-700' }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Link>

              <Link
                to="/optimize"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                activeProps={{ className: 'text-blue-600 hover:text-blue-700' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Optimize
              </Link>
              <Link
                to="/toggle"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                activeProps={{ className: 'text-blue-600 hover:text-blue-700' }}
              >
                <ToggleLeft className="w-4 h-4 mr-2" />
                Toggle
              </Link>
              <Link
                to="/agents"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                activeProps={{ className: 'text-blue-600 hover:text-blue-700' }}
              >
                <Bot className="w-4 h-4 mr-2" />
                Agents
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet /> {/* child routes get rendered here */}
      </main>
    </div>
  );
}
