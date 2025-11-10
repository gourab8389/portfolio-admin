"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  validator?: (value: string) => boolean;
  disabled?: boolean;
}

export const TagInput = ({
  value = [],
  onChange,
  placeholder = "Type and press Enter to add",
  className,
  maxTags,
  allowDuplicates = false,
  validator,
  disabled = false,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string>("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    
    // Clear any previous errors
    setError("");

    // Validate empty input
    if (!trimmedValue) {
      return;
    }

    // Check max tags limit
    if (maxTags && value.length >= maxTags) {
      setError(`Maximum ${maxTags} items allowed`);
      return;
    }

    // Check for duplicates
    if (!allowDuplicates && value.includes(trimmedValue)) {
      setError("This item already exists");
      return;
    }

    // Custom validation
    if (validator && !validator(trimmedValue)) {
      setError("Invalid input");
      return;
    }

    // Add the tag
    onChange([...value, trimmedValue]);
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
    setError("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[42px]">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="pl-3 pr-1 py-1 text-sm"
          >
            <span className="mr-1">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              disabled={disabled}
              className="rounded-full hover:bg-muted p-0.5 transition-colors disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};