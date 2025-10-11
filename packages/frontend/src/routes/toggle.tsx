import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toggleAPI } from '../api/client';
import { Switch } from '@headlessui/react';
import { Loader2, Check, X } from 'lucide-react';

export const Route = createFileRoute('/toggle')({
  component: ToggleComponent,
});

function ToggleComponent() {
  const [featureName, setFeatureName] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [result, setResult] = useState<{ feature: string; enabled: boolean } | null>(null);

  const toggleMutation = useMutation({
    mutationFn: toggleAPI,
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureName.trim()) return;

    toggleMutation.mutate({
      feature: featureName.trim(),
      enabled,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Feature Toggle</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage feature flags and toggles
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="feature" className="block text-sm font-medium text-gray-700 mb-2">
                Feature Name
              </label>
              <input
                id="feature"
                type="text"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                placeholder="Enter feature name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                disabled={toggleMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  disabled={toggleMutation.isPending}
                  className={`${
                    enabled ? 'bg-green-600' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <span className="text-sm text-gray-700">
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {toggleMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Error: {(toggleMutation.error as Error).message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={toggleMutation.isPending || !featureName.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              {toggleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Toggle</span>
              )}
            </button>
          </form>

          {result && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Feature</p>
                    <p className="text-lg font-semibold text-gray-900">{result.feature}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.enabled ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
