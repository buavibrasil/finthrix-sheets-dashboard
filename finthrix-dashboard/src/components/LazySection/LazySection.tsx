import React, { memo, ReactNode, Suspense } from 'react';
import { useLazyComponent } from '@/hooks/useLazyComponent';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string;
}

const LazySectionComponent: React.FC<LazySectionProps> = ({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '100px',
  minHeight = '200px'
}) => {
  const { elementRef, isVisible } = useLazyComponent({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const defaultFallback = (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ minHeight }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm">Carregando seção...</p>
      </div>
    </div>
  );

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ minHeight }}
    >
      {isVisible ? (
        <Suspense fallback={fallback || defaultFallback}>
          {children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export const LazySection = memo(LazySectionComponent);