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
  if (!loading) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
        {tip && <p className="text-sm text-muted-foreground">{tip}</p>}
      </div>
    </div>
  );
}
