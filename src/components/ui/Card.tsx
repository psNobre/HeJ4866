import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, title, subtitle, action }: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className={cn("card-base card-content", className)}>
    {(title || subtitle || action) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          {title && <h3 className="text-lg md:text-xl font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-muted text-xs md:text-sm mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);
