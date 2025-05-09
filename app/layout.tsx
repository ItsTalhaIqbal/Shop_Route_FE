import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/redux/provider";



export const metadata: Metadata = {
  title: "Shop Route"

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased ` }
        cz-shortcut-listen="true"
        
      >
        <Providers>{children}</Providers>
        
      </body>
    </html>
  );
}
