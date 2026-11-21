import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error in UI tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
            An unexpected error occurred in the application view. Your data in local storage is safe.
          </p>

          {this.state.error && (
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-3 text-left mb-6 overflow-x-auto text-xs font-mono text-gray-700">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReload}
              className="rounded-xl h-10 px-4 text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Reload Page
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={this.handleGoHome}
              className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white rounded-xl h-10 px-4 text-xs font-semibold"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
