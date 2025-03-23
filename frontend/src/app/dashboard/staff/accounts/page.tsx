"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAllAccounts,
  Merchant,
  Staff,
} from "@/app/dashboard/staff/accounts/account.service";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

const deleteUser = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Deleting user with ID: ${id}`);
};

export default function UsersManagementPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<(Merchant | Staff)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllAccounts()
      .then((response) => {
        const allAccounts = [...response.merchants, ...response.staff];
        setAccounts(allAccounts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch accounts:", error);
        toast({
          title: "Error",
          description: "Failed to load accounts. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [searchParams, toast]);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setAccounts((prev) => prev.filter((account) => account.id !== id));
      toast({
        title: "User deleted",
        description: "The user has been successfully removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  function getUserType(account: Merchant | Staff): string {
    return "merchant" in account ? "Merchant" : "Staff";
  }

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/staff"]}
        breadcrumbPage={["Dashboard"]}
        currentPage="Accounts"
      />

      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center gap-2">
          <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
          <h1>Accounts</h1>
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Street ID</TableHead>
            <TableHead>Street Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.email}</TableCell>
              <TableCell>{account.phone}</TableCell>
              <TableCell className="text-xs">
                {`${account.address.province}, ${account.address.district}, ${account.address.commune}`}
              </TableCell>
              <TableCell>{account.street}</TableCell>
              <TableCell>{getUserType(account)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/staff/accounts/${account.id}`}>
                      View or Edit
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDelete(userToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
