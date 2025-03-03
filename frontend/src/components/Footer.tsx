import Link from "next/link";
import { Facebook, FacebookIcon, Package } from "lucide-react";
import {
  FaFacebook,
  FaLinkedin,
  FaT,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container z-50 place-self-center w-full flex items-center justify-between gap-4 py-10">
        <div className="flex items-center flex-wrap grow gap-4 px-2">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h3 className="hidden md:block">ParcelPoint</h3>
            </div>
            <span className="text-center self-center text-sm leading-loose hidden lg:inline">
              Built by{" "}
              <Link
                href="https://github.com/phaspez"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                phaspez
              </Link>{" "}
              aka{" "}
              <span rel="noreferrer" className="font-medium">
                Tri-Min Tram
              </span>
              . The source code is available on{" "}
              <Link
                href="https://github.com/phaspez/parcelpoint"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </Link>
              .
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 px-2 md:px-0">
          <div>
            <nav className="flex w-full flex-row-reverse items-center gap-4 text-xl md:text-3xl pt-2 pb-4">
              <Link href="#">
                <FaTiktok />
              </Link>
              <Link href="#">
                <FaYoutube />
              </Link>
              <Link href="#">
                <FaLinkedin />
              </Link>
              <Link href="#">
                <FaFacebook />
              </Link>
              <small className="hidden md:block text-sm text-secondary-foreground">
                Talk with us
              </small>
            </nav>
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
      </div>
    </footer>
  );
}
