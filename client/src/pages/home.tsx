import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MOCK_IMAGES } from "@/lib/constants";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <div className="container mx-auto px-4 pt-24">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF1B8D] via-[#BD00FF] to-[#00F9FF] text-transparent bg-clip-text"
          >
            Welcome to SynthFur
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            A synthwave-themed art sharing platform for furry artists
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link href="/gallery">
              <Button size="lg" className="bg-[#FF1B8D] hover:bg-[#ff1b8d]/80">
                Browse Gallery
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="border-[#00F9FF] text-[#00F9FF] hover:bg-[#00F9FF]/10">
                Upload Artwork
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {MOCK_IMAGES.artworks.slice(0, 8).map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-square rounded-lg overflow-hidden"
            >
              <img
                src={image}
                alt={`Featured artwork ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
