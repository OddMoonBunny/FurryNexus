import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AgeGate() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(true);

  const handleVerification = (verified: boolean) => {
    if (verified) {
      // Store verification in localStorage if remember choice is selected
      if (rememberChoice) {
        localStorage.setItem('age-verified', 'true');
      } else {
        // Use sessionStorage if user doesn't want to remember
        sessionStorage.setItem('age-verified', 'true');
      }
      setLocation('/browser');
    } else {
      setError(true);
      // If not verified, redirect to a safe page
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A2E] flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full bg-[#2D2B55] border-[#BD00FF]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Age Verification Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-gray-200">
            <p className="mb-4">
              This gallery contains content that may be inappropriate for minors.
              Please verify that you are of legal age to view this content.
            </p>
            {error && (
              <div className="flex items-center justify-center gap-2 text-[#FF1B8D] mb-4">
                <AlertTriangle className="h-5 w-5" />
                <p>You must be of legal age to access this content</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 justify-center mb-6">
            <Switch
              id="remember-choice"
              checked={rememberChoice}
              onCheckedChange={setRememberChoice}
            />
            <Label htmlFor="remember-choice" className="text-gray-200">Remember my choice</Label>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="bg-[#BD00FF] hover:bg-[#BD00FF]/80 text-white w-full"
              onClick={() => handleVerification(true)}
            >
              I am 18 or older
            </Button>
            <Button
              variant="outline"
              className="border-[#BD00FF] text-white hover:bg-[#BD00FF]/20"
              onClick={() => handleVerification(false)}
            >
              I am under 18
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}