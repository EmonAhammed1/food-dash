import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "FoodDash | Premium Food Delivery",
  description: "Get your favorite meals delivered fast from top-rated local restaurants. Experience the ultimate pathao/foodpanda style food delivery clone.",
  keywords: "food delivery, order food, nextjs food app, pathao clone, foodpanda clone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
