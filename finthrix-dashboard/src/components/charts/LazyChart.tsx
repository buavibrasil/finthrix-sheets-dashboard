import React, { Suspense } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface LazyChartProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
  fallback?: React.ReactNode;
}

const ChartSkeleton = ({ height = "300px" }: { height?: string }) => (
  <div 
    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-gray-400 dark:text-gray-500">
      <svg 
        className="w-12 h-12" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  </div>
);

export const LazyChart: React.FC<LazyChartProps> = ({ 
  children, 
  height = "300px", 
  className = "",
  fallback 
}) => {
  const { elementRef, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  return (
    <div 
      ref={elementRef} 
      className={className}
      style={{ minHeight: height }}
    >
      {isVisible ? (
        <Suspense fallback={fallback || <ChartSkeleton height={height} />}>
          {children}
        </Suspense>
      ) : (
        fallback || <ChartSkeleton height={height} />
      )}
    </div>
  );
};