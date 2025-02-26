"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Package, generateFakePackages } from "@/lib/fake-data";
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
import { fetchOrders, fetchPackages } from "@/lib/data";
import { useUserStore } from "@/stores/userStore";
import { Check, EllipsisVertical, Filter, Search, X } from "lucide-react";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Order } from "@/types/order";
import { formatTimestamp } from "@/lib/regionFormat";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = useCookies();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [idSearchTerm, setIdSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [urgentFilter, setUrgentFilter] = useState<boolean | undefined>();
  const [fragileFilter, setFragileFilter] = useState<boolean | undefined>();

  const queryPage = parseInt(searchParams.get("page") || "1", 10);
  const queryLimit = parseInt(searchParams.get("limit") || "30", 10);
  const [currentPage, setCurrentPage] = useState(queryPage);
  const [ITEMS_PER_PAGE, setItemsPerPage] = useState(queryLimit);

  // Update URL when pagination changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateQuery(newPage, ITEMS_PER_PAGE);
  };

  // Update URL function
  const updateQuery = (page: number, limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    setCurrentPage(queryPage);
    setItemsPerPage(queryLimit);
  }, [queryPage, queryLimit]);

  const isUUIDv4 = (str: string) => {
    const uuidv4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    console.log(uuidv4Regex.test(str));
    return uuidv4Regex.test(str);
  };

  // the fetch data effect
  useEffect(() => {
    async function fetchAllPackages() {
      const access_token = cookies.get("token");
      if (!access_token) return;

      //const order_id = isUUIDv4(idSearchTerm) ? idSearchTerm : undefined;

      const data = await fetchOrders(access_token);
      console.log(data);
      setOrders(data);
      setFilteredOrders(data);
    }

    fetchAllPackages();
  }, [
    currentPage,
    idSearchTerm,
    ITEMS_PER_PAGE,
    statusFilter,
    urgentFilter,
    fragileFilter,
    searchTerm,
  ]);

  useEffect(() => {
    let result = orders;

    if (currentPage <= 0 || !currentPage) setCurrentPage(1);
    if (ITEMS_PER_PAGE <= 0 || !ITEMS_PER_PAGE) setItemsPerPage(30);

    if (searchTerm) {
      result = result.filter((pkg) =>
        pkg.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredOrders(result);
  }, [
    orders,
    searchTerm,
    idSearchTerm,
    statusFilter,
    urgentFilter,
    fragileFilter,
  ]);

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/merchant"]}
        breadcrumbPage={["Dashboard"]}
        currentPage="Orders"
      />

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Orders</h1>
      </span>

      <div className="hidden flex-wrap gap-4 mb-4 items-center">
        <Search />
        <Input
          placeholder="Search by receiver name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Search by package ID"
          value={idSearchTerm}
          onChange={(e) => setIdSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="hidden flex-wrap gap-4 mb-4 items-center">
        <Filter />
        <Select onValueChange={(value) => setStatusFilter(value || undefined)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="ORDERED">Ordered</SelectItem>
            <SelectItem value="DELIVERING">Delivering</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="MISSING">Missing</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            setUrgentFilter(
              value === "true" ? true : value === "false" ? false : undefined,
            )
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Urgent</SelectItem>
            <SelectItem value="false">Not Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            setFragileFilter(
              value === "true" ? true : value === "false" ? false : undefined,
            )
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by fragility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Fragile</SelectItem>
            <SelectItem value="false">Not Fragile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Order Details</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead className="w-[100px]">Packages Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((ord) => (
            <TableRow key={ord.id} className="h-12">
              <TableCell>{ord.id}</TableCell>
              <TableCell>{ord.details}</TableCell>
              <TableCell>{formatTimestamp(ord.date)}</TableCell>
              <TableCell>{ord.count}</TableCell>
              <TableCell>
                {
                  <Link href={`/dashboard/merchant/orders/${ord.id}`}>
                    <Button>
                      <EllipsisVertical />
                    </Button>
                  </Link>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  href="#"
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationLink href="#">{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
