
import React, { useState, useEffect } from "react";
import { Alert, AlertTitle } from "./alert";
import { X } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  autoHideDuration?: number;
}

export function ErrorAlert({ 
  message, 
  onClose, 
  autoHideDuration = 5000 
}: ErrorAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  if (!visible) return null;

  return (
    <Alert 
      variant="destructive" 
      className="bg-[#2D2B55] border-[#FF1B8D] mb-4 flex justify-between items-start"
    >
      <div>
        <AlertTitle className="text-[#FF1B8D]">Error</AlertTitle>
        <p className="text-white">{message}</p>
      </div>
      <button 
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="text-white hover:text-gray-300"
      >
        <X size={20} />
      </button>
    </Alert>
  );
}
import * as React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ 
  title = "Error", 
  message, 
  className,
  onDismiss 
}: ErrorAlertProps) {
  return (
    <div className={cn(
      "bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md relative",
      className
    )}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
        <div className="flex-grow">
          {title && <h5 className="font-medium">{title}</h5>}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            className="ml-4 text-destructive/70 hover:text-destructive"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
