import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export default function AuthLayout({ children }) {
  return (
    <main className={`${inter.className} text-(--textColor)`}>
      <div>{children}</div>
    </main>
  );
}
