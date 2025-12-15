import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { rpc } from '../rpc-client.js';
import { ClientRouter } from '../client-router.js';
import { Switch } from '@headlessui/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/toggle')({
  component: ToggleComponent,
})

interface Agent {
  id: string;
  name: string;
  description: string;
  currentPrompt: string;
  originalPrompt: string;
  toggle: boolean;
  createdAt: string;
}

function ToggleComponent() {
  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      return await rpc(ClientRouter.ListAgents({}));
    },
    staleTime: 1000,
    refetchOnWindowFocus: true,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, toggle }: { id: string; toggle: boolean }) => {
      return await rpc(ClientRouter.ToggleAgent({ id, toggle }));
    },
    onMutate: async ({ id, toggle }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['agents'] });
      
      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(['agents']);
      
      // Optimistically update the cache
      queryClient.setQueryData<Agent[]>(['agents'], (old) => {
        if (!old) return old;
        return old.map(agent => 
          agent.id === id 
            ? { ...agent, toggle } 
            : agent
        );
      });
      
    },
    onSuccess: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleToggle = (id: string, currentToggle: boolean) => {
    toggleMutation.mutate({ id, toggle: !currentToggle });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Agent Optimization Toggle</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enable or disable optimization for each agent. When enabled, the agent's prompts will be optimized automatically.
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading agents...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Error loading agents: {(error as Error).message}
              </p>
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-3">
              {agents.map((agent: Agent) => (
                <div
                  key={agent.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>ID: {agent.id}</span>
                        <span className="mx-2">•</span>
                        <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center space-x-3">
                      <div className="text-right mr-2">
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          Optimization
                        </p>
                        <p className={`text-sm font-semibold ${agent.toggle ? 'text-green-600' : 'text-gray-500'}`}>
                          {agent.toggle ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                        <Switch
                          checked={agent.toggle}
                          onChange={() => handleToggle(agent.id, agent.toggle)}
                          disabled={toggleMutation.isPending}
                          className={`${
                            agent.toggle ? 'bg-green-600' : 'bg-gray-300'
                          } relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span
                            className={`${
                              agent.toggle ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No agents found. Create your first agent to get started!</p>
            </div>
          )}

          {toggleMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Error updating toggle: {(toggleMutation.error as Error).message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
