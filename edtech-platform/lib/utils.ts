import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats Supabase storage URLs to be usable in the browser
 * Handles both direct storage URLs and paths
 */
export function formatStorageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // If it's already a full URL, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it's a relative path starting with "/", it's likely a local asset
  if (url.startsWith("/")) {
    return url;
  }

  // If it's a Supabase storage path
  if (
    url.startsWith("avatars/") ||
    url.startsWith("courses/") ||
    url.startsWith("videos/")
  ) {
    // Construct the proper Supabase storage URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return url; // Fallback if env var is missing

    return `${supabaseUrl}/storage/v1/object/public/${url}`;
  }

  // Return as is if we can't determine the format
  return url;
}
