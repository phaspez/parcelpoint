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
import { useUserStore } from "@/stores/userStore";
import { AccountWithType } from "@/types/account";
import { redirect, useRouter } from "next/navigation";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

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
  const { setUser, setToken } = useUserStore();

  const cookie = useCookies();
  const schema = usePhone ? phoneSchema : emailSchema;
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const user = { username: "", password: values.password };
    if ("phone" in values) {
      user.username = values.phone;
    } else if ("email" in values) {
      user.username = values.email;
    }
    console.log(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/account/login");

    await axios
      .post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/account/login",
        user,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
      .then(async (res) => {
        const access_token = res.data.access_token;
        cookie.set("token", access_token, { expires: 14 });
        setToken(access_token);
        console.log(access_token);

        await axios
          .get(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/account/me", {
            withCredentials: true,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${access_token}`,
            },
          })
          .then((res) => {
            const data = res.data as AccountWithType;
            setUser(data);
            toast({
              title: `Hello, ${data.type.toLowerCase()} ${data.name}!`,
            });
            if (data.type == "MERCHANT") {
              router.push("/dashboard/merchant");
            }
            if (data.type == "STAFF") {
              router.push("/dashboard/staff");
            }
          });
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
          const message = error.response.data.detail || error.message;
          console.error(message);
          toast({
            title: "Failed to login",
            variant: "destructive",
            description: <div>{error.message}</div>,
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
    <div className="flex min-h-screen items-center justify-center">
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
                          autoComplete="current-password"
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

              <div className="flex items-center gap-4">
                <Button type="submit" className="w-full">
                  Login
                </Button>

                <GoogleLogin
                  theme="filled_black"
                  onError={() => {
                    console.log("error");
                  }}
                  onSuccess={async (response) => {
                    console.log("success");
                    console.log(response);
                    try {
                      const result = await fetch(
                        "http://localhost:8000/api/v1/auth/google",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            token: response.credential,
                          }),
                        },
                      );
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                />
              </div>
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
          <div></div>
        </CardFooter>
      </Card>
    </div>
  );
}
