import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Logistics. Streamlined.
        </h1>
        <p className="mt-3 text-xl text-gray-500 sm:mt-5 sm:text-2xl max-w-md mx-auto">
          Manage your parcels with ease and efficiency.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Link href="/dashboard" passHref>
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex">
            <Link href="/register" passHref>
              <Button variant="outline" size="lg">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
