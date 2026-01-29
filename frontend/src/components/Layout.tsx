import { Layout as AntLayout, Alert } from "antd";
import { useVisualization } from "@/hooks/useVisualization";
import VisualizationRouter from "@/components/VisualizationRouter";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchPanel from "@/components/SearchPanel";
import ChatPanel from "@/components/ChatPanel";
import MetaPanel from "@/components/MetaPanel";
import "@/components/Layout.css";

export default function Layout() {
  const { loading, error, meta, data } = useVisualization();

  return (
    <AntLayout style={{ height: "100vh", width: "100vw" }}>
      <AntLayout.Sider width={300} className="sidebar">
        <div className="sidebar-content">
          <h2>OntoSight</h2>
          {meta && <MetaPanel meta={meta} />}
        </div>
      </AntLayout.Sider>

      <AntLayout>
        <AntLayout.Content className="visualization-container">
          <LoadingSpinner loading={loading} tip="Loading visualization...">
            {error && (
              <Alert message="Error" description={error} type="error" showIcon />
            )}
            {!error && data && <VisualizationRouter data={data} meta={meta} />}
          </LoadingSpinner>
        </AntLayout.Content>
      </AntLayout>

      <AntLayout.Sider width={350} className="sidebar-right">
        <div className="sidebar-content">
          <SearchPanel />
          <ChatPanel />
        </div>
      </AntLayout.Sider>
    </AntLayout>
  );
}
