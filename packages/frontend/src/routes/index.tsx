import { createFileRoute, Link } from '@tanstack/react-router';
import { MessageSquare, Sparkles, ToggleLeft } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Effectful Prompt Optimizer
        </h1>
        <p className="text-lg text-gray-600">
          Choose a feature to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/chat"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat</h2>
            <p className="text-gray-600">
              Interact with the chat API
            </p>
          </div>
        </Link>

        <Link
          to="/optimize"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Optimize</h2>
            <p className="text-gray-600">
              Optimize your prompts
            </p>
          </div>
        </Link>

        <Link
          to="/toggle"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <ToggleLeft className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Toggle</h2>
            <p className="text-gray-600">
              Manage feature toggles
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}