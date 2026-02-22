import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata = {
  title: "Staycation Journal",
  description: "Our Memory Spot"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-shell">
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}