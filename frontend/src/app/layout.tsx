import "./globals.css"; import Link from "next/link";
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>
    <nav style={{padding:10,background:"#eee"}}><Link href="/">Home</Link> | <Link href="/products">Products</Link> | <Link href="/search">Search</Link></nav>
    <main style={{padding:20}}>{children}</main>
  </body></html>;
}
