import { Provider } from "react-redux"
import { Toaster } from "sonner"
import { store } from "./redux/store"
import AppRoutes from "./AppRoutes"

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: "font-sans",
        }}
      />
    </Provider>
  )
}

export default App
