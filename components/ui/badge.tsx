import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'default',
  className,
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 border';
  
  const variantClasses = {
    default: 'bg-primary border-transparent text-primary-foreground',
    secondary: 'bg-secondary border-transparent text-secondary-foreground',
    destructive: 'bg-destructive border-transparent text-destructive-foreground',
    outline: 'bg-transparent border-current text-foreground'
  };

  const sizeClasses = {
    default: 'px-2.5 py-0.5 text-xs font-semibold',
    sm: 'px-2 py-0.5 text-xs font-medium',
    lg: 'px-3 py-1 text-sm font-semibold'
  };

  return (
    <View 
      className={cn(
        baseClasses, 
        variantClasses[variant], 
        sizeClasses[size],
        className
      )} 
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className="font-medium text-xs">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}