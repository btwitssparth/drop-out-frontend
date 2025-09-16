import { TextInput, TextInputProps } from 'react-native'
import { cn } from '../../lib/utils'

interface InputProps extends TextInputProps {
  className?: string
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "border border-gray-300 rounded-md px-3 py-3 text-base bg-white focus:border-blue-500 focus:outline-none",
        className
      )}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  )
}