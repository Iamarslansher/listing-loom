import "./globals.css";

export const metadata = {
  title: "ListingLoom — Better listings, woven in seconds",
  description:
    "Turn your product notes into marketplace-ready listings, SEO titles, and keywords with ListingLoom.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
