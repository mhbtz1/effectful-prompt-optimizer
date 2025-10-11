import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Effect } from 'effect';
import { rpc } from '../rpc-client.js';
import { ClientRouter } from '../client-router.js';
import { Trash2, Plus, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/agents')({
  component: RouteComponent,
})

interface Agent {
  id: string;
  name: string;
  description: string;
  userPrompt: string;
  createdAt: string;
  toggle: boolean;
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    userPrompt: ''
  });

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const effect = rpc(ClientRouter.ListAgents({}));
      return await Effect.runPromise(effect);
    },
    refetchInterval: 5000,
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; userPrompt: string }) => {
      const effect = rpc(ClientRouter.CreateAgent(data));
      return await Effect.runPromise(effect);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setFormData({ name: '', description: '', userPrompt: '' });
      setShowCreateForm(false);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const effect = rpc(ClientRouter.DeleteAgent({ id }));
      return await Effect.runPromise(effect);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.userPrompt.trim()) return;
    createAgentMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Agents</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your AI agents
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold mb-4">Create New Agent</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Prompt
                </label>
                <textarea
                  value={formData.userPrompt}
                  onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the system prompt for this agent"
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createAgentMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {createAgentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', description: '', userPrompt: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
              {createAgentMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    Error: {(createAgentMutation.error as Error).message}
                  </p>
                </div>
              )}
            </form>
          </div>
        )}

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading agents...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Error loading agents: {(error as Error).message}
              </p>
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent: Agent) => (
                <div
                  key={agent.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                          System Prompt
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                          {agent.userPrompt}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {agent.id}</span>
                        <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded ${agent.toggle ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {agent.toggle ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      disabled={deleteAgentMutation.isPending}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete agent"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No agents found. Create your first agent!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
