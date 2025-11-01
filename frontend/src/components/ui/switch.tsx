// components/ui/switch.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked
      if (checked === undefined) {
        setIsChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
    }

    const currentChecked = checked !== undefined ? checked : isChecked

    return (
      <label className={cn(
        "inline-flex items-center cursor-pointer",
        props.disabled && "cursor-not-allowed opacity-50"
      )}>
        <input
          type="checkbox"
          className="sr-only"
          checked={currentChecked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600",
            className
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }