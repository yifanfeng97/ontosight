import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white/10 backdrop-blur-[60px] p-4">
          <div className="w-full max-w-md relative">
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-4 bg-rose-500/10 blur-[40px] rounded-full opacity-50 pointer-events-none" />
            
            <div className="relative z-10 p-10 rounded-[3rem] bg-white/70 border border-white backdrop-blur-[80px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-rose-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Something went wrong</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                  {this.state.error?.message || "An unexpected error occurred in the visualization engine"}
                </p>
              </div>

              <button
                onClick={this.handleReset}
                className="w-full mt-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 font-black tracking-widest text-[10px] uppercase shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 active:scale-95"
              >
                Retry System
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
