import { Link, useLocation } from "wouter";
import { Home, Package, Store, User, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function BottomNavbar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: location === "/"
    },
    {
      href: "/products",
      icon: Package,
      label: "Products",
      active: location.startsWith("/products")
    },
    {
      href: "/stores",
      icon: Store,
      label: "Store",
      active: location.startsWith("/stores")
    },
    {
      href: "/store-maps",
      icon: MapPin,
      label: "Store Map",
      active: location === "/store-maps"
    },
    {
      href: user ? "/account" : "/login",
      icon: User,
      label: "Account",
      active: location.startsWith("/account") || location.startsWith("/customer-dashboard") || location.startsWith("/shopkeeper-dashboard")
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}