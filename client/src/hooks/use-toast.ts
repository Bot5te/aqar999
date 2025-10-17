import { ToastActionElement, ToastProps } from "@/components/ui/toast";
import * as React from "react";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type Toast = Omit<ToasterToast, "id">;

// Simple mock implementation that just logs to console
function createToast(props: any) {
  console.log('[Toast]', props);
  return {
    id: Math.random().toString(),
    dismiss: () => {},
    update: () => {},
  };
}

// Simplified provider that doesn't do anything
export function ToastProvider({ children }: any) {
  return children;
}

// Simple hook
export function useToast() {
  return {
    toast: createToast,
    dismiss: () => {},
    toasts: [] as any[],
  };
}

// For direct usage
export const toast = createToast;