import { Link } from "wouter";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product.id, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    const wasInWishlist = isInWishlist(product.id);
    await toggleWishlist(product.id);
    
    toast({
      title: wasInWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${wasInWishlist ? "removed from" : "added to"} your wishlist.`,
    });
  };

  const discount = product.originalPrice 
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card overflow-hidden">
        <div className="relative">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
            alt={product.name}
            className="w-full h-32 md:h-48 object-cover"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              {discount}% OFF
            </Badge>
          )}
          
          {/* Wishlist Heart Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={handleWishlistToggle}
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${
                    isInWishlist(product.id) 
                      ? "fill-red-500 text-red-500" 
                      : "text-gray-600 hover:text-red-400"
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="p-2 md:p-4">
          <h3 className="font-medium text-foreground text-xs md:text-sm mb-1 md:mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 text-xs mr-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(Number(product.rating)) ? "fill-current" : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.totalReviews})
            </span>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2 mb-2 md:mb-3">
            <span className="text-sm md:text-lg font-bold text-foreground">
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                ₹{Number(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAddToCart}
                className="w-full btn-secondary text-xs md:text-sm"
                size="sm"
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden md:inline">Add to Cart</span>
                <span className="md:hidden">Add</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add {product.name} to cart</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Link>
  );
}
