import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1A1A2E] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-[#2D2B55] border-[#BD00FF]">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-[#FF1B8D]" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-[#FF1B8D] via-[#BD00FF] to-[#00F9FF] text-transparent bg-clip-text">
              404 - Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-gray-300">
              Looks like you've ventured into the digital void.
              This page doesn't exist in our synthwave universe.
            </p>

            <div className="pt-4">
              <Link href="/">
                <Button 
                  className="bg-[#FF1B8D] hover:bg-[#FF1B8D]/80 text-white px-8 py-6 text-lg"
                >
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Decorative grid background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,#1A1A2E_1px),linear-gradient(90deg,transparent_1px,#1A1A2E_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-25"></div>
      </div>
    </div>
  );
}