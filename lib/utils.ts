import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// the one util shadcn components import. vendored like the components themselves.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}