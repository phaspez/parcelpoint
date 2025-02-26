"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPricingOptions } from "@/lib/data";
import { PricingOption } from "@/types/pricingOptions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

// Define the form schema
const packageSchema = z.object({
  width: z.number().min(0, "Width must be a positive number"),
  length: z.number().min(0, "Length must be a positive number"),
  height: z.number().min(0, "Height must be a positive number"),
  weight: z.number().min(0, "Weight must be a positive number"),
  isFragile: z.boolean(),
  isUrgent: z.boolean(),
  pricingId: z.string().uuid("Please select a pricing option"),
});

type PackageForm = z.infer<typeof packageSchema>;

const calculatePrice = async (
  packageDetails: PackageForm,
  pricingOption: PricingOption,
): Promise<number> => {
  let price = pricingOption.base_rate;

  // Calculate volume
  const volume =
    packageDetails.width * packageDetails.length * packageDetails.height;

  // Add oversize fee if volume > 1000 cm³ (arbitrary threshold)
  if (volume > 1000) {
    price += pricingOption.oversize_rate;
  }

  // Add overweight fee
  if (packageDetails.weight > pricingOption.base_weight) {
    price +=
      (packageDetails.weight - pricingOption.base_weight) *
      pricingOption.overweight_rate_per_kg;
  }

  // Add fragile fee
  if (packageDetails.isFragile) {
    price += pricingOption.fragile_rate;
  }

  // Add urgent fee
  if (packageDetails.isUrgent) {
    price += pricingOption.urgent_rate;
  }

  return Number(price.toFixed(2));
};

const VNDong = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function PricingPage() {
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<PackageForm>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      width: 0,
      length: 0,
      height: 0,
      weight: 0,
      isFragile: false,
      isUrgent: false,
      pricingId: "",
    },
  });

  useEffect(() => {
    fetchPricingOptions().then(setPricingOptions);
  }, []);

  async function onSubmit(data: PackageForm) {
    setIsCalculating(true);
    const selectedPricingOption = pricingOptions.find(
      (option) => option.id === data.pricingId,
    );
    if (selectedPricingOption) {
      const price = await calculatePrice(data, selectedPricingOption);
      setCalculatedPrice(price);
    }
    setIsCalculating(false);
  }

  return (
    <div className="container py-10 px-10 w-full place-content-center">
      <AutoBreadcrumb
        breadcrumbLink={[]}
        breadcrumbPage={[]}
        currentPage="Pricing"
      />

      <h1 className="">Shipping Price Estimator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Calculate Shipping Cost</CardTitle>
          <CardDescription>
            Enter package details to estimate shipping fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
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
                  name="isFragile"
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
                  name="isUrgent"
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
              <FormField
                control={form.control}
                name="pricingId"
                render={({ field }) => (
                  <FormItem>
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
              <Button type="submit" disabled={isCalculating}>
                {isCalculating ? "Calculating..." : "Calculate Price"}
              </Button>
            </form>
          </Form>
        </CardContent>
        {calculatedPrice !== null && (
          <CardFooter>
            <div className="w-full text-center">
              <h4 className="">Estimated Shipping Cost</h4>
              <h3 className="text-3xl font-bold">
                {VNDong.format(calculatedPrice)}
              </h3>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
