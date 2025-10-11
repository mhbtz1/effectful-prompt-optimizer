import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { optimizeAPI } from '../api/client';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

export const Route = createFileRoute('/optimize')({
  component: OptimizeComponent,
});

function OptimizeComponent() {
  const [prompt, setPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const optimizeMutation = useMutation({
    mutationFn: optimizeAPI,
    onSuccess: (data) => {
      setOptimizedPrompt(data.optimized_prompt);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    optimizeMutation.mutate({ prompt: prompt.trim() });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Optimize Prompt</h2>
          <p className="text-sm text-gray-600 mt-1">
            Improve your prompts using AI optimization
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="Enter the prompt you want to optimize..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                disabled={optimizeMutation.isPending}
              />
            </div>

            {optimizeMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Error: {(optimizeMutation.error as Error).message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={optimizeMutation.isPending || !prompt.trim()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              {optimizeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize Prompt</span>
                </>
              )}
            </button>
          </form>

          {optimizedPrompt && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Optimized Prompt
                </label>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="whitespace-pre-wrap text-gray-900">{optimizedPrompt}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
