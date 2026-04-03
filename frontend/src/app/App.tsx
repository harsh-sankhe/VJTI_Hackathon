import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen dark bg-background text-foreground transition-colors duration-300">
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
