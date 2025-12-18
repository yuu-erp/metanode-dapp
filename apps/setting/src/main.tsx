import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import { QueryClientProvider } from '@tanstack/react-query'
import reportWebVitals from './reportWebVitals.ts'
import { queryClient } from './shared/lib/react-query/index.ts'
import './styles.css'
import { LoginProfileProvider } from './contexts/login-profile.context.tsx'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} context={{ queryClient }} />
}
// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <LoginProfileProvider>
        <App />
      </LoginProfileProvider>
    </QueryClientProvider>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
