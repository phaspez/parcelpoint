"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchOrders } from "@/lib/data";
import {
  Check,
  Clipboard,
  EllipsisVertical,
  Filter,
  Package2,
  Receipt,
  Search,
  Trash,
} from "lucide-react";
import { useCookies } from "next-client-cookies";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Order } from "@/types/order";
import { formatTimestamp } from "@/lib/regionFormat";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";
import { useToast } from "@/hooks/use-toast";
import { deleteOrder, fetchAllOrders } from "@/app/dashboard/staff/orders/data";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function OrdersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = useCookies();

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [idSearchTerm, setIdSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [urgentFilter, setUrgentFilter] = useState<string | undefined>();
  const [fragileFilter, setFragileFilter] = useState<string | undefined>();

  // Get pagination parameters from URL
  const queryPage = parseInt(searchParams.get("page") || "1", 10);
  const queryLimit = parseInt(searchParams.get("limit") || "30", 10);
  const [currentPage, setCurrentPage] = useState(queryPage);
  const [itemsPerPage, setItemsPerPage] = useState(queryLimit);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Update URL when pagination changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    updateQuery(newPage, itemsPerPage);
  };

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Update URL function
  const updateQuery = (page: number, limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    router.push(`?${params.toString()}`);
  };

  // Sync state with URL parameters
  useEffect(() => {
    setCurrentPage(queryPage);
    setItemsPerPage(queryLimit);
  }, [queryPage, queryLimit]);

  // Fetch data effect
  useEffect(() => {
    async function fetchPaginatedOrders() {
      const access_token = cookies.get("token");
      if (!access_token) return;

      setLoading(true);

      try {
        const result = await fetchAllOrders(queryPage, queryLimit);

        setOrders(result.data);
        setTotalItems(result.items);
        setTotalPages(result.page_count);
      } catch (error) {
        console.error("Error fetching paginated orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPaginatedOrders();
  }, [
    cookies,
    queryPage,
    queryLimit,
    searchTerm,
    idSearchTerm,
    statusFilter,
    urgentFilter,
    fragileFilter,
  ]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handleItemsPerPageChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
    updateQuery(1, newLimit);
  };

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/staff"]}
        breadcrumbPage={["Dashboard"]}
        currentPage="Orders"
      />

      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center gap-2">
          <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
          <h1>Orders</h1>
        </span>
        <span className="grow" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="hidden md:block">
          <Receipt size={64} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <Search className="text-muted-foreground" />
          <Input
            placeholder="Search by order details"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading orders...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="w-[100px]">Packages Count</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((ord, idx) => (
                    <TableRow key={ord.id} className="h-12">
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {ord.id.substring(0, 8)}...
                        <CopyToClipboard
                          text={ord.id}
                          onCopy={() => handleCopy(ord.id)}
                        >
                          <Button variant="outline" className="ml-2">
                            {copiedId === ord.id ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Clipboard size={16} />
                            )}
                          </Button>
                        </CopyToClipboard>
                      </TableCell>
                      <TableCell className="font-medium">
                        {ord.details}
                      </TableCell>
                      <TableCell>{formatTimestamp(ord.date)}</TableCell>
                      <TableCell>{ord.count}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Link href={`/dashboard/staff/orders/${ord.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {orders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} orders
              </div>

              <Pagination className="mx-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                      href="#"
                    />
                  </PaginationItem>

                  {getPageNumbers().map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={() => handlePageChange(pageNum)}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                      href="#"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="w-32"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
