import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toast";
import { useVisualization } from "@/hooks/useVisualization";
import { apiClient } from "@/services/api";

function AppContent() {
  const { setMeta, setData, setLoading, setError } = useVisualization();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("[App] Fetching meta...");
        const meta = await apiClient.getMeta();
        console.log("[App] Meta response:", meta);
        setMeta(meta);

        console.log("[App] Fetching data...");
        const data = await apiClient.getData();
        console.log("[App] Data response:", data);
        console.log("[App] Data structure:", {
          dataKeys: data ? Object.keys(data) : "N/A",
          type: meta?.type
        });
        setData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        console.error("[App] Error:", message, err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setMeta, setData, setLoading, setError]);

  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  );
}
