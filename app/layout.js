import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "ListingLoom — Better listings, woven in seconds",
  description:
    "Turn your product notes into marketplace-ready listings, SEO titles, and keywords with ListingLoom.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
