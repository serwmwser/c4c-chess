import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "C4C Chess",
  description: "Play chess casually or stake C4C tokens against other players.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
