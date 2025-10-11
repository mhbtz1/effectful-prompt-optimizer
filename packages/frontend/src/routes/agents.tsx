import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { rpc } from '../rpc-client.js';
import { ClientRouter } from '../client-router.js';

export const Route = createFileRoute('/agents')({
  component: RouteComponent,
})

function RouteComponent() {
    const {data, isLoading, error} = useQuery({
        queryKey: ['agents'],
        queryFn: () => {
            return rpc(ClientRouter.ListAgents({}))
        },
        refetchInterval: 5000,
    })

  console.log(`data: ${JSON.stringify(data)}`)
  return <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold">Agents</h1>
        {data!.map( (agent: any) => {
            return <span className="p-4 mt-4"> {agent.name} </span>
        })}
        {isLoading && <span>Loading...</span>}
  </div>
}
