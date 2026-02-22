import "./globals.css";

export const metadata = {
  title: "Staycation Journal",
  description: "Private Disney-first memory journal"
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