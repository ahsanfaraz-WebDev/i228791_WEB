"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatStorageUrl } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * A component for displaying user avatars with proper fallbacks
 */
export function UserAvatar({
  src,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const [error, setError] = useState(false);

  // Determine size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  // Generate initials from name
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Format the image URL to handle Supabase storage paths
  const formattedSrc = formatStorageUrl(src);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {formattedSrc && !error ? (
        <AvatarImage
          src={formattedSrc}
          alt={name || "User"}
          onError={() => setError(true)}
        />
      ) : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
