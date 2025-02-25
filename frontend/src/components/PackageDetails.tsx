import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PackageBadge from "@/components/PackageBadge";
import {
  ArrowDownFromLine,
  ArrowUpFromLine,
  BookUser,
  FileClock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatTimestamp, VNDong } from "@/lib/regionFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, PackageHistory } from "@/types/packages";
import { Address, Merchant } from "@/app/dashboard/staff/packages/data";
import { Account } from "@/types/account";

interface MerchantContact {
  merchant: Merchant;
  account: Account;
  address: Address;
}

interface PackageDetailsProps {
  packageData: Package;
  merchantContact: MerchantContact | null;
  address: Address;
  historyData: PackageHistory[];
}

export default function PackageDetails({
  packageData,
  merchantContact,
  address,
  historyData,
}: PackageDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription>
          <div className="flex items-start flex-wrap gap-4">
            <span className="grow">
              <PackageBadge badge_name={packageData.status} />
            </span>
            <div>
              <div className="text-sm text-gray-500">
                Package ID: {packageData.id}
              </div>
              <div className="text-sm text-gray-500">
                Merchant ID: {packageData.merchant_id}
              </div>
              <div className="text-sm text-gray-500">
                Order ID: {packageData.order_id}
              </div>
              <div>
                <p className="text-lg pt-2">{packageData.description}</p>
              </div>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="flex gap-2 items-center">
          <BookUser />
          Properties
        </h3>
        <Separator />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pt-4 pb-10">
          <div>
            <p className="font-semibold">Weight</p>
            <h4>{packageData.weight} kg</h4>
          </div>
          <div>
            <p className="font-semibold">Dimensions</p>
            <h4>
              {packageData.width} x {packageData.height} x {packageData.length}{" "}
              cm
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
        <h3 className="flex gap-2 items-center">
          <ArrowUpFromLine /> Sender
        </h3>
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

        <h3 className="flex gap-2 items-center">
          <ArrowDownFromLine /> Receiver
        </h3>
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
        <h3 className="flex gap-2 items-center">
          <FileClock />
          Tracking history
        </h3>
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
  );
}
