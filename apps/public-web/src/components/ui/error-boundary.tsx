'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  moduleName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[ModuleError] ${this.props.moduleName}:`, error.message);
  }

  render() {
    if (this.state.hasError) {
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Module &quot;{this.props.moduleName}&quot; encountered an error.
          </div>
        );
      }
      return null;
    }
    return this.props.children;
  }
}
