"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { fetchAllAccounts } from "@/app/dashboard/staff/accounts/account.service";
import { Account } from "@/types/account";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "merchant" | "staff" | "customer";
  createdAt: string;
}

const deleteUser = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Deleting user with ID: ${id}`);
};

export default function UsersManagementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("all");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";

    setCurrentPage(page);
    setSearchTerm(search);
    setUserType(type);

    fetchAllAccounts().then((accounts) => {
      console.log(accounts);
      setUsers(accounts);
      setIsLoading(false);
    });
  }, [searchParams]);

  const handleSearch = () => {
    router.push(`/staff/users?page=1&search=${searchTerm}&type=${userType}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
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

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  function clampText(text: string, maxLength: number = 8): string {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
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
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Street ID</TableHead>
            <TableHead>Street Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-mono text-xs">{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell className="font-mono text-xs">
                {clampText(user.address_id)}
              </TableCell>
              <TableCell>{user.street}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/staff/accounts/${user.id}`}>
                      View or Edit
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
