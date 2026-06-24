import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import '@/shared/lib/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { FinsdkProvider2 } from './components/finsk.context-2.tsx'
import reportWebVitals from './reportWebVitals.ts'
import { routeTree } from './routeTree.gen'
import { queryClient } from './shared/lib/react-query.ts'
import './styles.css'
import { debug } from 'file-core'
import { contractClient } from '@mtnts/contract-client'

console.log('test instance', debug === contractClient)

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  history: createHashHistory()
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <FinsdkProvider2>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </FinsdkProvider2>
  )
}

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
