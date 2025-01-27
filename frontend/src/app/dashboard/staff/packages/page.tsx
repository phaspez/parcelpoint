"use client";

import { useState, useEffect } from "react";
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
import { fetchPackages } from "@/app/dashboard/staff/packages/data";
import {
  Check,
  Cross,
  EllipsisVertical,
  Filter,
  Plus,
  Search,
  X,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PackageBadge from "@/components/PackageBadge";
import { Package } from "@/types/packages";
import { formatTimestamp } from "@/lib/regionFormat";

export default function PackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = useCookies();

  const [packages, setPackages] = useState<Package[]>([]);
  const [idSearchTerm, setIdSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [urgentFilter, setUrgentFilter] = useState<boolean | undefined>();
  const [fragileFilter, setFragileFilter] = useState<boolean | undefined>();

  const queryPage = parseInt(searchParams.get("page") || "1", 10);
  const queryLimit = parseInt(searchParams.get("limit") || "30", 10);
  const [currentPage, setCurrentPage] = useState(queryPage);
  const [ITEMS_PER_PAGE, setItemsPerPage] = useState(queryLimit);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateQuery(newPage, ITEMS_PER_PAGE);
  };

  const handleClearSearch = () => {
    setIdSearchTerm("");
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

      const order_id = isUUIDv4(idSearchTerm) ? idSearchTerm : undefined;
      const data = await fetchPackages(
        {
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          is_fragile: fragileFilter,
          is_urgent: urgentFilter,
          order_id: order_id,
          status: statusFilter == "ALL" ? undefined : statusFilter,
        },
        access_token,
      );
      setPackages(data);
    }

    fetchAllPackages();
  }, [
    currentPage,
    idSearchTerm,
    ITEMS_PER_PAGE,
    statusFilter,
    urgentFilter,
    fragileFilter,
  ]);

  useEffect(() => {
    if (currentPage <= 0 || !currentPage) setCurrentPage(1);
    if (ITEMS_PER_PAGE <= 0 || !ITEMS_PER_PAGE) setItemsPerPage(30);
  }, [packages, idSearchTerm, statusFilter, urgentFilter, fragileFilter]);

  return (
    <div className="container">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/staff">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Packages</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Packages</h1>
      </span>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <Search />
        <Input
          placeholder="Search by Order ID"
          value={idSearchTerm}
          onChange={(e) => setIdSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {idSearchTerm && (
          <Button variant="secondary" onClick={handleClearSearch}>
            <X />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
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
            <TableHead className="w-[100px]">Merchant ID</TableHead>
            <TableHead>Receiver Name</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead className="w-[100px]">Receiver Phone</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[50px]">Weight</TableHead>
            <TableHead className="w-[50px]">Urgent</TableHead>
            <TableHead className="w-[50px]">Fragile</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell>{pkg.merchant_id.slice(0, 8)}...</TableCell>
              <TableCell>{pkg.name}</TableCell>
              <TableCell>{formatTimestamp(pkg.order_date)}</TableCell>
              <TableCell>{pkg.phone}</TableCell>
              <TableCell>{<PackageBadge badge_name={pkg.status} />}</TableCell>
              <TableCell>{pkg.weight} kg</TableCell>
              <TableCell>{pkg.is_urgent ? <Check /> : <X />}</TableCell>
              <TableCell>{pkg.is_fragile ? <Check /> : <X />}</TableCell>
              <TableCell>
                <Link href={`/dashboard/staff/packages/${pkg.id}`} passHref>
                  <Button variant="outline" size="sm">
                    <EllipsisVertical />
                  </Button>
                </Link>
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
