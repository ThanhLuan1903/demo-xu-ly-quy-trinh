"use client";

import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  size = 24,
}: {
  size?: number;
}) {
  return (
    <Loader2
      style={{ width: size, height: size }}
      className="animate-spin text-blue-600"
    />
  );
}
