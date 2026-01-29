import { ConfigProvider } from "antd";
import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import { useVisualization } from "@/hooks/useVisualization";
import { apiClient } from "@/services/api";

export default function App() {
  const { setMeta, setData, setLoading, setError } = useVisualization();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const meta = await apiClient.getMeta();
        setMeta(meta);

        const data = await apiClient.getData();
        setData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setMeta, setData, setLoading, setError]);

  return (
    <ErrorBoundary>
      <ConfigProvider theme={{ token: { colorPrimary: "#1890ff" } }}>
        <Layout />
      </ConfigProvider>
    </ErrorBoundary>
  );
}
