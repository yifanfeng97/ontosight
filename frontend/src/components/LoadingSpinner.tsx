import { Spin } from "antd";
import "@/components/LoadingSpinner.css";

interface LoadingSpinnerProps {
  loading: boolean;
  tip?: string;
  children?: React.ReactNode;
}

export default function LoadingSpinner({
  loading,
  tip = "Loading...",
  children,
}: LoadingSpinnerProps) {
  return (
    <Spin spinning={loading} tip={tip} size="large">
      <div className="loading-container">{children}</div>
    </Spin>
  );
}
