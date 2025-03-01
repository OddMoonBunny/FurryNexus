import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Palette, Upload, User, Search } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#1A1A2E] border-b border-[#BD00FF] shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Changed logo to use a div instead of an anchor */}
        <Link href="/">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#FF1B8D] to-[#00F9FF] text-transparent bg-clip-text cursor-pointer">
            SynthFur
          </div>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/gallery">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Palette className="h-4 w-4" />
                    <span>Gallery</span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/upload">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/den/1">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Den</span>
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}