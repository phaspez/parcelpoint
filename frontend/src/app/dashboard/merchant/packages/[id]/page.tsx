"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchPackageById, fetchPackageHistory } from "@/lib/data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, PackageHistory } from "@/types/packages";
import { useToast } from "@/hooks/use-toast";
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
import PackageDetails from "@/components/PackageDetails";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

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
      <AutoBreadcrumb
        breadcrumbLink={[
          "/dashboard/merchant/",
          "/dashboard/merchant/packages",
        ]}
        breadcrumbPage={["Dashboard", "Packages"]}
        currentPage={id?.toString()}
      />

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
      <PackageDetails
        packageData={packageData}
        merchantContact={merchantContact}
        address={address}
        historyData={historyData}
      />
    </div>
  );
}
