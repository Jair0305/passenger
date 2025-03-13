"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputValue(newColor)
    onChange(newColor)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Only update the parent if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            <div className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: color }} />
            <span>{inputValue}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <Label htmlFor="color-picker">Select Color</Label>
            <div className="mt-1 relative">
              <input
                ref={colorInputRef}
                type="color"
                id="color-picker"
                value={color}
                onChange={handleColorChange}
                className="w-full h-10 p-1 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hex-value">Hex Value</Label>
            <Input
              id="hex-value"
              value={inputValue}
              onChange={handleHexInputChange}
              className="mt-1"
              placeholder="#000000"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

