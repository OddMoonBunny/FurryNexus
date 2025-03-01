import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { User, Search, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#1A1A2E] border-b border-[#BD00FF] shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#FF1B8D] to-[#00F9FF] text-transparent bg-clip-text cursor-pointer">
            SynthFur
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={`/den/${user.id}`}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Den</span>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <Button
              variant="outline"
              className="border-[#FF1B8D] text-[#FF1B8D] hover:bg-[#FF1B8D]/10"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Link href="/auth">
              <Button className="bg-[#FF1B8D] hover:bg-[#FF1B8D]/80">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}