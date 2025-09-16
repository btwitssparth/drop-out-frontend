import { View, ViewProps } from 'react-native'
import { cn } from '../../lib/utils'

interface CardProps extends ViewProps {
  children: React.ReactNode
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <View
      className={cn("p-6 pb-0", className)}
      {...props}
    >
      {children}
    </View>
  )
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <View
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </View>
  )
}