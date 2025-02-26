"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { AddressSearch } from "@/components/AddressSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPricingOptions } from "@/lib/data";
import { PricingOption } from "@/types/pricingOptions";
import { VNDong } from "@/lib/regionFormat";
import { fetchCreatePackage } from "@/lib/dataCreate";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

const calculatePrice = (
  packageDetails: PackageForm,
  pricingOptions: PricingOption[],
): number => {
  const selectedOption = pricingOptions.find(
    (option) => option.id === packageDetails.package_rate_id,
  );

  if (!selectedOption) return 0;

  let price = selectedOption.base_rate;

  const volume =
    packageDetails.width * packageDetails.length * packageDetails.height;

  // Add oversize fee if volume > 1000 cm³
  if (volume > 1000) {
    price += selectedOption.oversize_rate;
  }

  if (packageDetails.weight > selectedOption.base_weight) {
    price +=
      (packageDetails.weight - selectedOption.base_weight) *
      selectedOption.overweight_rate_per_kg;
  }

  if (packageDetails.is_fragile) {
    price += selectedOption.fragile_rate;
  }

  if (packageDetails.is_urgent) {
    price += selectedOption.urgent_rate;
  }

  return Number(price.toFixed(2));
};

const packageSchema = z.object({
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Receiver name is required"),
  phone: z.string().min(1, "Receiver phone is required"),
  address_id: z.string().min(1, "Receiver address is required"),
  package_rate_id: z.string().min(1, "Package rate option is required"),
  width: z.number().min(0, "Width must be a positive number"),
  length: z
    .number()
    .min(0, "Length must be a positive number")
    .gte(2, "Package must be at minimum of size 2 cm"),
  height: z
    .number()
    .min(0, "Height must be a positive number")
    .gte(2, "Package must be at minimum of size 2 cm"),
  weight: z
    .number()
    .min(0, "Weight must be a positive number")
    .gte(2, "Package must be at minimum of size 2 cm"),
  street: z.string().min(1, "Street is required"),
  is_fragile: z.boolean(),
  is_urgent: z.boolean(),
  cod_cost: z.number().min(0, "COD amount must be a positive number"),
});

type PackageForm = z.infer<typeof packageSchema>;

export default function CreatePackagePage() {
  const { toast } = useToast();
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PackageForm>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      description: "",
      name: "",
      phone: "",
      street: "",
      address_id: "",
      package_rate_id: "",
      width: 0,
      length: 0,
      height: 0,
      weight: 0,
      is_fragile: false,
      is_urgent: false,
      cod_cost: 0,
    },
  });

  useEffect(() => {
    const loadPricingOptions = async () => {
      const options = await fetchPricingOptions();
      setPricingOptions(options);
    };
    loadPricingOptions();
  }, []);

  const watchedFields = form.watch();

  useEffect(() => {
    if (watchedFields.package_rate_id) {
      const price = calculatePrice(watchedFields, pricingOptions);
      setCalculatedPrice(price);
    }
  }, [watchedFields, pricingOptions]);

  async function onSubmit(data: PackageForm) {
    try {
      setIsSubmitting(true);
      const respond = await fetchCreatePackage({ ...data, merchant_id: "" });

      toast({
        title: "Package created",
        description:
          "Your package has been successfully created. We will contact you shortly for confirmation.",
      });
      form.reset();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onBulkUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsSubmitting(true);
        // Here you would typically send the file to your API for processing
        console.log("Uploading file:", file.name);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating API call
        toast({
          title: "Bulk upload completed",
          description: "Your packages have been successfully created.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload packages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/merchant", "/dashboard/merchant/packages"]}
        breadcrumbPage={["Dashboard", "Packages"]}
        currentPage={"Create"}
      />

      <div className="flex items-center gap-2 mb-4">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Create New Order</h1>
      </div>

      <Tabs defaultValue="single">
        <div className="flex items-center mb-4">
          <Link
            href="/dashboard/merchant/packages"
            className="flex items-center"
            passHref
          >
            <Button variant="default" className="h-full">
              Back to Packages
            </Button>
          </Link>
          <span className="grow" />
          <TabsList>
            <TabsTrigger value="single">Single Package</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Create a Single Package</CardTitle>
              <CardDescription>
                Enter the details for your new package.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the contents of the package"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receiver Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receiver Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receiver Street</FormLabel>
                        <FormControl>
                          <Input placeholder="1DA St. street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <AddressSearch
                            onAddressSelectAction={(addressId) => {
                              field.onChange(addressId); // Use field.onChange instead of setValue
                            }}
                            selectedAddressId={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              step={0.1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value || "0"),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              step={0.1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value || "0"),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              step={0.1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value || "0"),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              step={0.1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value || "0"),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="is_fragile"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Fragile</FormLabel>
                            <FormDescription>
                              Check if the package contains fragile items
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_urgent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Urgent</FormLabel>
                            <FormDescription>
                              Check if the package requires urgent delivery
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="cod_cost"
                      render={({ field }) => (
                        <FormItem className="grow">
                          <FormLabel>COD Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Enter 0 if this is not a Cash on Delivery package
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="package_rate_id"
                      render={({ field }) => (
                        <FormItem className="grow">
                          <FormLabel>Shipping Option</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a shipping option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pricingOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <span className="flex items-center gap-4">
                    <p>Estimated Shipping fee:</p>
                    <h3>
                      {VNDong.format(calculatedPrice ? calculatedPrice : 0)}
                    </h3>
                    <span className="grow" />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Package"}
                    </Button>
                  </span>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Package Upload</CardTitle>
              <CardDescription>
                Upload a CSV file to create multiple packages at once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      CSV file (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={onBulkUpload}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Make sure your CSV file follows the required format.{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Download template
                </a>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
