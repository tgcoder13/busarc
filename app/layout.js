import "./globals.css";
import { Inter, Cinzel } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

export const metadata = {
  title: "D'Maverics Archive",
  description: "The link to reading and academic comeback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        <script type="text/javascript" src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
      </head>
      <body className="antialiased selection:bg-yellow-500/30 selection:text-yellow-200">
        {children}
      </body>
    </html>
  );
}
