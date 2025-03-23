"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAccountById,
  Merchant,
  Staff,
  BaseAccount,
} from "@/app/dashboard/staff/accounts/account.service";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  street: z.string().min(5, "Street must be at least 5 characters"),
  active: z.boolean().optional(),
});

const merchantFormSchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  merchant_description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

const staffFormSchema = z.object({
  position: z.string().min(2, "Position must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  access_level: z.string(),
});

const updateUserData = async (
  id: string,
  data: Partial<BaseAccount>,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Updating user data:", data);
};

const updateMerchantData = async (
  id: string,
  data: Partial<Merchant["merchant"]>,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Updating merchant data:", data);
};

const updateStaffData = async (
  id: string,
  data: Partial<Staff["staff"]>,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Updating staff data:", data);
};

export default function UserDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<Merchant | Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      street: "",
      active: true,
    },
  });

  const merchantForm = useForm<z.infer<typeof merchantFormSchema>>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      company_name: "",
      merchant_description: "",
    },
  });

  const staffForm = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      position: "",
      department: "",
      access_level: "1",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = params.id as string;
        const accountData = await fetchAccountById(userId);
        setAccount(accountData);

        userForm.reset({
          name: accountData.name,
          phone: accountData.phone,
          email: accountData.email,
          street: accountData.street,
        });

        if ("merchant" in accountData) {
          merchantForm.reset({
            company_name: accountData.merchant.company_name,
            merchant_description: accountData.merchant.merchant_description,
          });
        } else if ("staff" in accountData) {
          staffForm.reset({
            position: accountData.staff.position,
            department: accountData.staff.department,
            access_level: accountData.staff.access_level,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load user information. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, userForm, merchantForm, staffForm, toast]);

  const onUserSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      if (!account) return;

      await updateUserData(account.id, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        street: data.street,
      });

      toast({
        title: "Success",
        description: "User information updated successfully.",
      });
    } catch (error) {
      console.error("Error updating data:", error);
      toast({
        title: "Error",
        description: "Failed to update user information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onMerchantSubmit = async (data: z.infer<typeof merchantFormSchema>) => {
    try {
      if (!account || !("merchant" in account)) return;

      await updateMerchantData(account.id, {
        company_name: data.company_name,
        merchant_description: data.merchant_description,
      });

      toast({
        title: "Success",
        description: "Merchant information updated successfully.",
      });
    } catch (error) {
      console.error("Error updating data:", error);
      toast({
        title: "Error",
        description: "Failed to update merchant information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onStaffSubmit = async (data: z.infer<typeof staffFormSchema>) => {
    try {
      if (!account || !("staff" in account)) return;

      await updateStaffData(account.id, {
        position: data.position,
        department: data.department,
        access_level: data.access_level,
      });

      toast({
        title: "Success",
        description: "Staff information updated successfully.",
      });
    } catch (error) {
      console.error("Error updating data:", error);
      toast({
        title: "Error",
        description: "Failed to update staff information. Please try again.",
        variant: "destructive",
      });
    }
  };

  function getAccountType(account: Merchant | Staff): string {
    return "merchant" in account ? "merchant" : "staff";
  }

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (!account) {
    return <div className="container py-10">User not found</div>;
  }

  const accountType = getAccountType(account);

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit User: {account.name}</CardTitle>
          <CardDescription>
            User ID: <span className="font-mono">{account.id}</span> • Type:{" "}
            <span className="capitalize">{accountType}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              {accountType === "merchant" && (
                <TabsTrigger value="merchant">Merchant Details</TabsTrigger>
              )}
              {accountType === "staff" && (
                <TabsTrigger value="staff">Staff Details</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="basic">
              <Form {...userForm}>
                <form
                  onSubmit={userForm.handleSubmit(onUserSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
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
                      control={userForm.control}
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
                      control={userForm.control}
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
                      control={userForm.control}
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
                  </div>

                  <div>
                    <FormLabel>Full Address</FormLabel>
                    <FormDescription>
                      {account.address?.commune}, {account.address?.district},{" "}
                      {account.address?.province}
                    </FormDescription>
                  </div>
                  <Button type="submit">Update User Information</Button>
                </form>
              </Form>
            </TabsContent>

            {accountType === "merchant" && (
              <TabsContent value="merchant">
                <Form {...merchantForm}>
                  <form
                    onSubmit={merchantForm.handleSubmit(onMerchantSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={merchantForm.control}
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
                      control={merchantForm.control}
                      name="merchant_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel>Registration Date</FormLabel>
                      <FormDescription>
                        {"merchant" in account &&
                          account.merchant.registration_date}
                      </FormDescription>
                    </div>
                    <Button type="submit">Update Merchant Information</Button>
                  </form>
                </Form>
              </TabsContent>
            )}

            {accountType === "staff" && (
              <TabsContent value="staff">
                <Form {...staffForm}>
                  <form
                    onSubmit={staffForm.handleSubmit(onStaffSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={staffForm.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={staffForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={staffForm.control}
                      name="access_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Level</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Level 1 - Basic</SelectItem>
                              <SelectItem value="2">
                                Level 2 - Standard
                              </SelectItem>
                              <SelectItem value="3">
                                Level 3 - Advanced
                              </SelectItem>
                              <SelectItem value="4">
                                Level 4 - Manager
                              </SelectItem>
                              <SelectItem value="5">
                                Level 5 - Administrator
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Determines what actions this staff member can
                            perform in the system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel>Hire Date</FormLabel>
                      <FormDescription>
                        {"staff" in account && account.staff.hire_date}
                      </FormDescription>
                    </div>
                    <Button type="submit">Update Staff Information</Button>
                  </form>
                </Form>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
