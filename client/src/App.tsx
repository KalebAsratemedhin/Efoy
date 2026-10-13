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
        duration={2200}
        toastOptions={{
          className: "font-sans",
          duration: 2200,
        }}
      />
    </Provider>
  )
}

export default App
