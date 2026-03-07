import Providers from "@/providers";
import { AppRouterProvider } from "@/router";

function App() {
  return (
    <Providers>
      <AppRouterProvider />
    </Providers>
  );
}

export default App;
