import Link from "next/link";
import { Package } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container place-self-center w-full flex items-center justify-between gap-4 py-10">
        <div className="flex items-center grow gap-4 px-2">
          <div>
            <Package className="h-6 w-6" />
          </div>
          <span className="text-center self-center text-sm leading-loose hidden lg:inline">
            Built by{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              phaspez
            </a>{" "}
            aka{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Tri-Min Tram
            </a>
            . The source code is available on{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </span>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 px-2 md:px-0">
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <span className="hidden lg:inline p-0 m-0 border-0 text-sm text-center text-muted-foreground leading-none pt-0 mt-0">
              &copy; {currentYear} ParcelPoint. All rights reserved.
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
