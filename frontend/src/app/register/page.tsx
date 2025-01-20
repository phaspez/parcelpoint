"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { AddressSearch } from "@/components/AddressSearch";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { AccountCreate, MerchantCreate } from "@/types/account";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  phone: z.string().regex(/^0\d{9,10}$/, { message: "Invalid phone number" }),
  email: z.string().email({ message: "Invalid email address" }),
  address_id: z.string().min(1, { message: "Please select an address" }),
  street: z
    .string()
    .min(2, { message: "Street name must be at least 2 characters long" }),
});

const companyInfoSchema = z.object({
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters long" }),
  merchant_description: z
    .string()
    .min(10, {
      message: "Company description must be at least 10 characters long",
    })
    .max(500, {
      message: "Company description must not exceed 500 characters",
    }),
});

const registerSchema = z.object({
  ...personalInfoSchema.shape,
  ...companyInfoSchema.shape,
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      password: "",
      phone: "",
      email: "",
      address_id: "",
      street: "",
      company_name: "",
      merchant_description: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: RegisterForm) {
    const merchant_create: MerchantCreate = {
      ...values,
      registration_date: formatDate(new Date()),
    };
    const account_create = values as AccountCreate;

    console.log({ account_create, merchant_create });

    axios
      .post(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/merchant/register", {
        account_create,
        merchant_create,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
        toast({ title: error.message });
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className="grow">Register</CardTitle>
            <CardDescription>Step {step}/2</CardDescription>
          </div>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
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
                          <Input placeholder="+1234567890" {...field} />
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
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
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
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
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
                          <Textarea
                            placeholder="Brief description of your company"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="flex justify-between">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Previous
                  </Button>
                )}
                {step === 1 && (
                  <Button type="button" onClick={() => setStep(2)}>
                    Next
                  </Button>
                )}
                {step === 2 && <Button type="submit">Register</Button>}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
