import { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
};