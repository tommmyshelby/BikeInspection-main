
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Bike Inspection</title>
        <meta name="description" content="Bike Inspection System" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
