"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { fetchPackageById, fetchPackageHistory } from "@/lib/data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, PackageHistory } from "@/types/packages";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PackageBadge from "@/components/PackageBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatTimestamp } from "@/lib/regionFormat";
import { useToast } from "@/hooks/use-toast";
import { VNDong } from "@/lib/regionFormat";
import PopupEdit from "@/app/dashboard/staff/packages/[id]/PopupEdit";
import { useUserStore } from "@/stores/userStore";
import {
  Address,
  createPackageHistory,
  getAccountByID,
  getAddressByID,
  getMerchantByID,
  Merchant,
  PackageHistoryCreate,
  updatePackage,
} from "@/app/dashboard/staff/packages/data";
import { useRouter } from "next/navigation";
import { Account } from "@/types/account";

interface MerchantContact {
  merchant: Merchant;
  account: Account;
  address: Address;
}

export default function PackageDetailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [historyData, setHistoryData] = useState<PackageHistory[]>([]);
  const [editedPackage, setEditedPackage] = useState<Package | null>(null);
  const [merchantContact, setMerchantContact] =
    useState<MerchantContact | null>(null);
  const [address, setAddress] = useState<Address>({
    commune: "",
    province: "",
    district: "",
    id: "",
  });
  const { user, token } = useUserStore();

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        const [data, history] = await Promise.all([
          fetchPackageById(id as string, ""),
          fetchPackageHistory(id as string),
        ]);

        if (data) {
          setPackageData(data);
          setEditedPackage(data);

          const [merchant, base_merchant] = await Promise.all([
            getMerchantByID(data.merchant_id),
            getAccountByID(data.merchant_id),
          ]);
          console.log(merchant, base_merchant);
          if (!merchant || !base_merchant) return;

          const [merchant_address, address] = await Promise.all([
            getAddressByID(base_merchant.address_id),
            getAddressByID(data.address_id),
          ]);
          console.log(merchant_address, address);

          setMerchantContact({
            account: base_merchant,
            merchant: merchant,
            address: merchant_address,
          });

          if (address) setAddress(address);
        }

        if (history) setHistoryData(history);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [id]);

  const handleUpdatePackage = async (history: PackageHistoryCreate) => {
    if (!editedPackage || !user || !token) return;
    history.staff_id = user.id;
    try {
      await Promise.all([
        updatePackage(editedPackage.id, editedPackage, token),
        createPackageHistory(history, token),
      ]);

      setPackageData(editedPackage);

      const new_history = await fetchPackageHistory(id as string);
      if (new_history) setHistoryData(new_history);

      toast({
        title: "Package Updated",
        description: "Package information has been successfully updated.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the package information.",
        variant: "destructive",
      });
    }
  };

  if (!packageData || !editedPackage || !user) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/merchant/">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/merchant/packages">
              Packages
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span className="flex items-center gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Package Details</h1>
      </span>
      <div className="flex gap-4 mb-4">
        <Link
          href="/dashboard/merchant/packages"
          className="flex items-center"
          passHref
        >
          <Button variant="secondary" className="flex items-center h-full">
            Back to Packages
          </Button>
        </Link>
        <Link
          href={`/dashboard/merchant/orders/${packageData.order_id}`}
          className="flex items-center"
          passHref
        >
          <Button variant="default" className="flex items-center h-full">
            View Order
          </Button>
        </Link>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-4">
              <h2>NO. {packageData.id}</h2>
              <PackageBadge badge_name={packageData.status} />
            </span>
          </CardTitle>
          <CardDescription>
            <div className="text-sm text-gray-500">
              Merchant ID: {packageData.merchant_id}
            </div>
            <div className="text-sm text-gray-500">
              Order ID: {packageData.order_id}
            </div>
            <div>
              <p className="text-lg pt-2">{packageData.description}</p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3>Details</h3>
          <Separator />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4 pb-10">
            <div>
              <p className="font-semibold">Weight</p>
              <h4>{packageData.weight} kg</h4>
            </div>
            <div>
              <p className="font-semibold">Dimensions</p>
              <h4>
                {packageData.width} x {packageData.height} x{" "}
                {packageData.length} cm
              </h4>
            </div>
            <div>
              <p className="font-semibold">Shipping Cost</p>
              <h4>{VNDong.format(packageData.shipping_cost)}</h4>
            </div>
            <div>
              <p className="font-semibold">COD Cost</p>
              <h4>{VNDong.format(packageData.cod_cost)}</h4>
            </div>
            <div>
              <p className="font-semibold">Urgent</p>
              <h4>{packageData.is_urgent ? "Yes" : "No"}</h4>
            </div>
            <div>
              <p className="font-semibold">Fragile</p>
              <h4>{packageData.is_fragile ? "Yes" : "No"}</h4>
            </div>
            <div>
              <p className="font-semibold">Storage Block</p>
              <h4>{packageData.block_id || "None"}</h4>
            </div>
          </div>
          <h3>Sender</h3>
          <Separator />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4 pb-10">
            <div className="col-span-2">
              <p className="font-semibold">Address</p>
              <div className="grid xl:grid-cols-2">
                <h4>{merchantContact?.account.street}</h4>
                <h4>{`${merchantContact?.address.district}, ${merchantContact?.address.district}, ${merchantContact?.address.province}`}</h4>
              </div>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <h4>{merchantContact?.account.phone}</h4>
            </div>
          </div>

          <h3>Receiver</h3>
          <Separator />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4 pb-10">
            <div>
              <p className="font-semibold">Name</p>
              <div>
                <h4>{packageData.name}</h4>
              </div>
            </div>
            <div className="">
              <p className="font-semibold">Address</p>
              <div className="">
                <h4>{packageData.street}</h4>
                <h4>{`${address.commune}, ${address.district}, ${address.province}`}</h4>
              </div>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <h4>{packageData.phone}</h4>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <h3>Tracking history</h3>
          <Separator />
          <Table>
            <TableHeader className="h-12">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Done by Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((history) => (
                <TableRow key={history.id} className="h-12">
                  <TableCell>{formatTimestamp(history.timestamp)}</TableCell>
                  <TableCell>{history.notes}</TableCell>
                  <TableCell>{history.action}</TableCell>
                  <TableCell>{history.staff_id.slice(0, 8)}...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
