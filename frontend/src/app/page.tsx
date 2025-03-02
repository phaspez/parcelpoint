import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Clock, Search, Shield, Truck, Users } from "lucide-react";
import { BsAmazon } from "react-icons/bs";
import Marquee from "react-fast-marquee";
import StaggeredCards from "@/components/StaggeredCards";
import BackgroundBlob from "@/components/BackgroundBlob";

export default function HomePage() {
  const customer_brand = [
    {
      name: "Vascara",
      url: "https://giaohangtietkiem.vn/_next/image/?url=https%3A%2F%2Fcache.giaohangtietkiem.vn%2Fd%2F131a8fa8b4b8f0d089b5b75ee90f90b3.png&w=256&q=75",
    },
    {
      name: "Format",
      url: "https://giaohangtietkiem.vn/_next/image/?url=https%3A%2F%2Fcache.giaohangtietkiem.vn%2Fd%2F2406b2d4591efddb72fc2b181bf00a6f.png&w=256&q=75",
    },
    {
      name: "Cocoon",
      url: "https://giaohangtietkiem.vn/_next/image/?url=https%3A%2F%2Fcache.giaohangtietkiem.vn%2Fd%2F046b9ba850d6df366d54a421f3724b1d.png&w=256&q=75",
    },
    {
      name: "PNJ",
      url: "https://giaohangtietkiem.vn/_next/image/?url=https%3A%2F%2Fcache.giaohangtietkiem.vn%2Fd%2F824e17c0938ad006c7de7b3b95223908.png&w=256&q=75",
    },
    {
      name: "Realme",
      url: "https://giaohangtietkiem.vn/_next/image/?url=https%3A%2F%2Fcache.giaohangtietkiem.vn%2Fd%2F8e9d449abe803f124f96fc3a7e5ee80e.png&w=256&q=75",
    },
    {
      name: "Pharmacity",
      url: "https://giaohangtietkiem.vn/_next/image/?url=https%3A%2F%2Fcache.giaohangtietkiem.vn%2Fd%2Fa11d05b45da0a5422ce169cee9e0203a.png&w=256&q=75",
    },
  ];

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]
    py-12 px-4 sm:px-6 lg:px-8"
    >
      <BackgroundBlob />
      <div className="text-center">
        <section className="w-full flex flex-wrap lg:grid grid-cols-2 place-content-center gap-4 items-center">
          <div className="pb-20">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Logistics. Streamlined.
            </h1>
            <p className="mt-3 text-xl sm:mt-5 sm:text-2xl max-w-md mx-auto">
              Manage your business with ease and efficiency.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Link href="/dashboard" passHref>
                  <Button size="lg" className="button accent-primary">
                    Get Started
                  </Button>
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
          <div className="hidden md:block w-full px-20">
            <StaggeredCards />
          </div>
        </section>

        {/* Customers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Happy Customers
            </h2>
            <Marquee
              className="mb-4"
              speed={25}
              gradient
              autoFill
              gradientColor={"hsl(var(--background))"}
            >
              <div className="flex items-center gap-6 text-6xl pl-6">
                {customer_brand.map((brand, index) => (
                  <Image
                    className="w-auto h-auto"
                    key={index}
                    alt={brand.name}
                    src={brand.url}
                    width={128}
                    height={75}
                  />
                ))}
              </div>
            </Marquee>
            <Marquee
              className="mb-4"
              speed={25}
              direction="right"
              gradient
              autoFill
              gradientColor={"hsl(var(--background))"}
            >
              <div className="flex items-center gap-6 text-6xl pl-6">
                {customer_brand.reverse().map((brand, index) => (
                  <Image
                    key={index}
                    alt={brand.name}
                    src={brand.url}
                    width={128}
                    height={75}
                  />
                ))}
              </div>
            </Marquee>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  title: "Real-time Tracking",
                  description:
                    "Monitor your parcels in real-time with our advanced tracking system",
                },
                {
                  icon: Truck,
                  title: "Nationwide Coverage",
                  description:
                    "Extensive network covering all 63 provinces and 11,000+ districts",
                },
                {
                  icon: Shield,
                  title: "Secure Handling",
                  description:
                    "State-of-the-art security measures to ensure your parcels' safety",
                },
                {
                  icon: Clock,
                  title: "Fast Delivery",
                  description:
                    "Optimized routes and efficient processes for speedy deliveries",
                },
                {
                  icon: Users,
                  title: "Customer Support",
                  description:
                    "Dedicated support team available 24/7 to assist you",
                },
                {
                  icon: BarChart,
                  title: "Analytics Dashboard",
                  description:
                    "Comprehensive insights into your shipping patterns and performance",
                },
              ].map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>
                      <h3 className="text-left">{feature.title}</h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-left">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold mb-4">
                  Unmatched Experience
                </h3>
                <p className="mb-4">
                  With over 1.5 billion packages delivered, we have the
                  expertise to handle your parcels with care and efficiency.
                </p>
                <h3 className="text-2xl font-semibold mb-4">
                  Extensive Network
                </h3>
                <p className="mb-4">
                  Our vast network of 2,000+ partners, 30,000+ staff, and 6,000+
                  drivers ensures your packages reach their destination quickly
                  and safely.
                </p>
                <h3 className="text-2xl font-semibold mb-4">
                  Cutting-edge Technology
                </h3>
                <p>
                  Our state-of-the-art tracking and management systems provide
                  you with real-time updates and complete control over your
                  shipments.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/bg_landing4.png"
                  width={600}
                  height={600}
                  className="place-self-center bg-blend-lighten rounded-lg ease-out -rotate-6 hover:rotate-0 transition-all duration-200 shadow-2xl"
                  alt="landing image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Showcase */}
        <section className="">
          <Card className="container mx-auto px-4 bg-gray-500 bg-[url('/bg_landing2.png')] bg-cover bg-blend-darken bg-bottom text-white">
            <CardContent className="py-16 rounded-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Our Impact in Numbers
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "1.5B+", label: "Packages Delivered" },
                  { value: "4.5M+", label: "Online Retailers" },
                  { value: "80M+", label: "Online Shoppers" },
                  { value: "2,000+", label: "Partners" },
                  { value: "30,000+", label: "Staff Members" },
                  { value: "6,000+", label: "Drivers" },
                  { value: "2,500+", label: "Trucks" },
                  { value: "600,000m²+", label: "Logistics Area" },
                ].map((stat, index) => (
                  <div key={index}>
                    <p className="text-2xl lg:text-4xl font-bold mb-2">
                      {stat.value}
                    </p>
                    <p className="text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Services Provided */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Domestic Shipping",
                  description:
                    "Fast and reliable shipping across all 63 provinces and 11,000+ districts",
                },
                {
                  title: "International Shipping",
                  description:
                    "Seamless global shipping solutions for your cross-border needs",
                },
                {
                  title: "Warehousing",
                  description:
                    "State-of-the-art warehousing facilities totaling over 600,000m² of logistics area",
                },
                {
                  title: "E-commerce Integration",
                  description:
                    "Easy integration with major e-commerce platforms for streamlined operations",
                },
                {
                  title: "Bulk Shipping",
                  description:
                    "Efficient solutions for high-volume shippers and large enterprises",
                },
                {
                  title: "Custom Logistics",
                  description:
                    "Tailored logistics solutions to meet your unique business needs",
                },
              ].map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>
                      <h3>{service.title}</h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call-to-action Footer */}
        <section className="py-20">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Parcel Management?
            </h2>
            <p className="text-xl mb-8">
              Join millions of satisfied customers and experience the future of
              logistics
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
