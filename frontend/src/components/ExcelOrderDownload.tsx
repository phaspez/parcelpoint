import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaFileExcel } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";

interface PackageFilters {
  blockId: string;
  orderId: string;
  isUrgent: boolean | null;
  isFragile: boolean | null;
  minWeight: string;
  maxWeight: string;
  status: string;
  daysAgo: number;
}

const PackageExport = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PackageFilters>({
    blockId: "",
    orderId: "",
    isUrgent: null,
    isFragile: null,
    minWeight: "",
    maxWeight: "",
    status: "",
    daysAgo: 365,
  });
  const { token } = useUserStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSelectChange = (name: keyof PackageFilters, value: string) => {
    if (name === "isUrgent" || name === "isFragile") {
      const booleanValue = value === "" ? null : value === "true";
      setFilters({
        ...filters,
        [name]: booleanValue,
      });
    } else if (name === "daysAgo") {
      setFilters({
        ...filters,
        [name]: parseInt(value) || 365,
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const downloadExcel = async () => {
    setLoading(true);
    setError(null);
    console.log(token);

    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "/api/v1/package/my_packages/export",
        {
          params: {
            block_id: filters.blockId || undefined,
            order_id: filters.orderId || undefined,
            is_urgent: filters.isUrgent,
            is_fragile: filters.isFragile,
            min_weight: filters.minWeight || undefined,
            max_weight: filters.maxWeight || undefined,
            status: filters.status || undefined,
            days_ago: filters.daysAgo || 365,
          },
          responseType: "blob",
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "packages.xlsx";

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading packages:", err);
      setError("Failed to download packages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="min-w-max">
        <Button className="max-w-fit">
          <RiFileExcel2Fill />
          Export Excel sheet...
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <RiFileExcel2Fill />
            Export Packages to Excel
          </DialogTitle>
          <DialogDescription>
            You can filter packages with some of the options below.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                name="orderId"
                value={filters.orderId}
                onChange={handleInputChange}
                placeholder="Filter by Order ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockId">Block ID</Label>
              <Input
                id="blockId"
                name="blockId"
                value={filters.blockId}
                onChange={handleInputChange}
                placeholder="Filter by Block ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Package Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDERED">Ordered</SelectItem>
                  <SelectItem value="DELIVERING">Delivering</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="MISSING">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isUrgent">Urgent</Label>
              <Select
                value={
                  filters.isUrgent === null ? "" : String(filters.isUrgent)
                }
                onValueChange={(value) => handleSelectChange("isUrgent", value)}
              >
                <SelectTrigger id="isUrgent">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isFragile">Fragile</Label>
              <Select
                value={
                  filters.isFragile === null ? "" : String(filters.isFragile)
                }
                onValueChange={(value) =>
                  handleSelectChange("isFragile", value)
                }
              >
                <SelectTrigger id="isFragile">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daysAgo">Days Ago</Label>
              <Select
                value={String(filters.daysAgo)}
                onValueChange={(value) => handleSelectChange("daysAgo", value)}
              >
                <SelectTrigger id="daysAgo">
                  <SelectValue placeholder="Past year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Past 30 days</SelectItem>
                  <SelectItem value="90">Past 90 days</SelectItem>
                  <SelectItem value="180">Past 6 months</SelectItem>
                  <SelectItem value="365">Past year</SelectItem>
                  <SelectItem value="730">Past 2 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minWeight">Min Weight</Label>
              <Input
                id="minWeight"
                name="minWeight"
                type="number"
                value={filters.minWeight}
                onChange={handleNumberChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWeight">Max Weight</Label>
              <Input
                id="maxWeight"
                name="maxWeight"
                type="number"
                value={filters.maxWeight}
                onChange={handleNumberChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex items-center gap-4">
            <Button
              onClick={downloadExcel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download />
                  Download Excel sheet
                </>
              )}
            </Button>
            <small className="text-secondary-foreground">
              This may take a few minutes.
            </small>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageExport;
