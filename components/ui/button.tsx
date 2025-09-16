import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native'
import { cn } from '../../lib/utils'

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
  disabled?: boolean
}

export function Button({ 
  children, 
  className, 
  variant = 'default',
  disabled = false,
  ...props 
}: ButtonProps) {
  const baseClasses = "px-4 py-3 rounded-md items-center justify-center"
  const variantClasses = {
    default: disabled ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700",
    outline: disabled ? "border border-gray-200 bg-gray-100" : "border border-gray-300 bg-white active:bg-gray-50"
  }

  return (
    <TouchableOpacity
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text 
          className={cn(
            "font-medium text-base",
            variant === 'default' 
              ? (disabled ? "text-white opacity-75" : "text-white") 
              : (disabled ? "text-gray-400" : "text-gray-900")
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}