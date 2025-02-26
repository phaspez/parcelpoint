"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getAddressByID } from "@/app/dashboard/staff/packages/data";
import { useUserStore } from "@/stores/userStore";
import { getMerchantByID } from "@/app/dashboard/staff/packages/data";
import { patchMerchantAccount } from "@/app/dashboard/merchant/you/data";

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address_id: string;
  street: string;
}

interface AddressData {
  id: string;
  province: string;
  district: string;
  commune: string;
}

interface MerchantData {
  account_id: string;
  company_name: string;
  merchant_description: string;
  registration_date: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  street: z.string().min(5, "Street must be at least 5 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  merchant_description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

export default function MerchantPersonalInfo() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      street: "",
      company_name: "",
      merchant_description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const userId = user.id;
        const address = await getAddressByID(user.address_id);
        const merchant = await getMerchantByID(userId);

        setUserData(user);
        setAddressData(address);
        setMerchantData(merchant);

        form.reset({
          name: user.name,
          phone: user.phone,
          email: user.email,
          street: user.street,
          company_name: merchant.company_name,
          merchant_description: merchant.merchant_description,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load personal information. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [form, user]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!userData || !merchantData || !token) return;

      await patchMerchantAccount(userData.id, token, data);

      toast({
        title: "Success",
        description: "Personal information updated successfully.",
      });
    } catch (error) {
      console.error("Error updating data:", error);
      toast({
        title: "Error",
        description: "Failed to update personal information. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Merchant Personal Information</CardTitle>
          <CardDescription>
            View and edit your personal and company information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Full Address</FormLabel>
                <FormDescription>
                  {addressData?.commune}, {addressData?.district},{" "}
                  {addressData?.province}
                </FormDescription>
              </div>
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="merchant_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Registration Date</FormLabel>
                <FormDescription>
                  {merchantData?.registration_date}
                </FormDescription>
              </div>
              <Button type="submit">Update Information</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
