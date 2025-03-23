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
import { Check, Cross, Filter, Package2, Plus, Search, X } from "lucide-react";
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
import PackageBadge from "@/components/PackageBadge";
import { Package } from "@/types/packages";
import { formatTimestamp } from "@/lib/regionFormat";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";
import ExcelOrderDownload from "@/components/ExcelOrderDownload";
import { Pagination as PaginationType } from "@/types/pagination";
import React from "react";

export default function PackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = useCookies();

  const [packagesData, setPackagesData] = useState<PaginationType<Package>>({
    data: [],
    current_page: 1,
    page_count: 1,
    items: 0,
  });

  const [idSearchTerm, setIdSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [urgentFilter, setUrgentFilter] = useState<boolean | undefined>();
  const [fragileFilter, setFragileFilter] = useState<boolean | undefined>();

  const queryPage = parseInt(searchParams.get("page") || "1", 10);
  const queryPageSize = parseInt(searchParams.get("page_size") || "30", 10);
  const [currentPage, setCurrentPage] = useState(queryPage);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateQuery(newPage, pageSize);
  };

  const handleClearSearch = () => {
    setIdSearchTerm("");
  };

  const updateQuery = (page: number, page_size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("page_size", page_size.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    setCurrentPage(queryPage);
    setPageSize(queryPageSize);
  }, [queryPage, queryPageSize]);

  const isUUIDv4 = (str: string) => {
    const uuidv4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidv4Regex.test(str);
  };

  useEffect(() => {
    async function fetchAllPackages() {
      const access_token = cookies.get("token");
      if (!access_token) return;

      const order_id = isUUIDv4(idSearchTerm) ? idSearchTerm : undefined;
      const data = await fetchPackages(
        {
          offset: currentPage,
          limit: pageSize,
          is_fragile: fragileFilter,
          is_urgent: urgentFilter,
          order_id: order_id,
          status: statusFilter == "ALL" ? undefined : statusFilter,
        },
        access_token,
      );
      console.log(data);
      setPackagesData(data);
    }

    fetchAllPackages();
  }, [
    currentPage,
    pageSize,
    idSearchTerm,
    statusFilter,
    urgentFilter,
    fragileFilter,
    cookies,
  ]);

  useEffect(() => {
    // Only update state from URL if they're different to avoid loops
    if (currentPage !== queryPage) setCurrentPage(queryPage);
    if (pageSize !== queryPageSize) setPageSize(queryPageSize);
  }, [queryPage, queryPageSize]);

  const generatePageNumbers = () => {
    const totalPages = packagesData.page_count;
    const currentPageNum = packagesData.current_page;

    let pages = [1];

    for (
      let i = Math.max(2, currentPageNum - 2);
      i <= Math.min(totalPages - 1, currentPageNum + 2);
      i++
    ) {
      pages.push(i);
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    pages = [...new Set(pages)].sort((a, b) => a - b);

    return pages;
  };

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/merchant"]}
        breadcrumbPage={["Dashboard"]}
        currentPage="Packages"
      />

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Packages</h1>
        <span className="grow" />
        <div className="hidden md:block">
          <Package2 size={64} />
        </div>
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
        <span className="grow" />
        <div className="flex justify-end items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              console.log("changing page size");
              const newPageSize = parseInt(value, 10);
              setPageSize(newPageSize);
              updateQuery(1, newPageSize);
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-2 text-sm text-muted-foreground">
        {packagesData.items > 0 && (
          <span>
            Showing {(packagesData.current_page - 1) * pageSize + 1} to{" "}
            {Math.min(packagesData.current_page * pageSize, packagesData.items)}{" "}
            of {packagesData.items} packages
          </span>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Receiver Name</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead className="w-[100px]">Receiver Phone</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[50px]">Weight</TableHead>
            <TableHead className="w-[50px]">Urgent</TableHead>
            <TableHead className="w-[50px]">Fragile</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packagesData.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No packages found
              </TableCell>
            </TableRow>
          ) : (
            packagesData.data.map((pkg, idx) => (
              <TableRow key={pkg.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>{formatTimestamp(pkg.order_date)}</TableCell>
                <TableCell>{pkg.phone}</TableCell>
                <TableCell>
                  {<PackageBadge badge_name={pkg.status} />}
                </TableCell>
                <TableCell>{pkg.weight} kg</TableCell>
                <TableCell>{pkg.is_urgent ? <Check /> : <X />}</TableCell>
                <TableCell>{pkg.is_fragile ? <Check /> : <X />}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/staff/packages/${pkg.id}`} passHref>
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

      <Pagination className="mt-4">
        <PaginationContent>
          {packagesData.previous && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  handlePageChange(packagesData.previous as number)
                }
                href="#"
              />
            </PaginationItem>
          )}

          {generatePageNumbers().map((pageNum, index, array) => (
            <React.Fragment key={pageNum}>
              {index > 0 && array[index - 1] !== pageNum - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={pageNum === packagesData.current_page}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          ))}

          {packagesData.next && (
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(packagesData.next as number)}
                href="#"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
