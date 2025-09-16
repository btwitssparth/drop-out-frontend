import { Text, TextProps } from 'react-native'
import { cn } from '../../lib/utils'

interface LabelProps extends TextProps {
  children: React.ReactNode
  className?: string
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <Text
      className={cn(
        "text-sm font-medium text-gray-900 mb-1",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
}