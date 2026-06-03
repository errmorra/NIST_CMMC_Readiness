import "./globals.css";

export const metadata = {
  title: "CMMC / NIST SP 800-171 Readiness Navigator",
  description:
    "Interactive crosswalk and readiness assessment tool for NIST SP 800-171 and CMMC Level 2 frameworks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
