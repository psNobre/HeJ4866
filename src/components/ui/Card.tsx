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
      <div className="flex-between mb-8">
        <div>
          {title && <h3 className="text-xl font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);
