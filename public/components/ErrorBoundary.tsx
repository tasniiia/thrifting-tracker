"use client";

import { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Replace with your own logging (Sentry, etc.) in production.
    console.error("Thrift I/O widget error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-[#A9A290]/40 bg-[#EDE8DC] rounded-lg p-6 text-center">
          <p className="text-sm text-[#3F3B30]/70 mb-3">
            {this.props.label ?? "This section"} hit a snag and couldn't load.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4F5B3E] hover:text-[#333829]"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
