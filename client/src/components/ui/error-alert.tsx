
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
