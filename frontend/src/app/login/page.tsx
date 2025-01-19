"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useCookies } from "next-client-cookies";
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
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^0\d{9,10}$/, { message: "Invalid phone number" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const [usePhone, setUsePhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const cookie = useCookies();
  const schema = usePhone ? phoneSchema : emailSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    await axios
      .post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/account/login",
        values,
      )
      .then(async (res) => {
        cookie.set("token", res.data.token, { expires: 14 });
        toast({
          title: "Successfully logged in!",
        });

        const test = cookie.get("token");
        console.log(test);
        const res_2 = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/account/me",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${test}`, // or whatever format your backend expects
            },
          },
        );
        console.log(res_2);
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
          const message = error.response.data.detail || error.message;
          toast({
            title: "Failed to login",
            variant: "destructive",
            description: <div>{message || error.message}</div>,
          });
        } else {
          toast({
            title: "Failed to login",
            variant: "destructive",
            description: <div>{(error as Error).message}</div>,
          });
        }
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-phone"
                  checked={usePhone}
                  onCheckedChange={setUsePhone}
                />
                <label htmlFor="use-phone" className="text-sm font-medium">
                  Use phone number
                </label>
              </div>

              <FormField
                control={form.control}
                name={usePhone ? "phone" : "email"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{usePhone ? "Phone Number" : "Email"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          usePhone ? "+1234567890" : "name@example.com"
                        }
                        {...field}
                      />
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don&#39;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
