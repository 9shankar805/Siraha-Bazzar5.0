import { Link } from "wouter";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { cartItems, updateCartItem, removeFromCart, totalAmount, totalItems, isLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-muted-foreground mb-4">
              You need to login to view your cart
            </p>
            <Link href="/login">
              <Button className="w-full">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div>Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Looks like you haven't added anything to your cart yet
              </p>
              <Link href="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({totalItems})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={item.product?.name || "Product"}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {item.product?.name || "Unknown Product"}
                      </h3>
                      <p className="text-primary font-semibold">
                        ₹{item.product ? Number(item.product.price).toLocaleString() : 0}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product?.stock || 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{item.product ? (Number(item.product.price) * item.quantity).toLocaleString() : 0}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-accent">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <Link href="/checkout">
                  <Button className="w-full btn-primary">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button variant="outline" className="w-full mt-3">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
