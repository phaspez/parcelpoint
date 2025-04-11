import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp, VNDong } from "@/lib/regionFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookUser, Box, Info, Trash } from "lucide-react";
import { Order } from "@/types/order";
import { Package } from "@/types/packages";

export interface OrderDetails {
  order: Order;
  packages: Package[];
}

interface OrderDetailsProp {
  order: OrderDetails;
  handleDeletePackage?: (id: string) => void;
  role: "staff" | "merchant";
}

export default function OrderDetailsCard({
  order,
  handleDeletePackage,
  role = "merchant",
}: OrderDetailsProp) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="">
          <h3 className="flex items-center gap-2">
            <BookUser /> Properties
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p>
                <strong>Order ID:</strong> {order.order.id}
              </p>
              <p>
                <strong>Merchant ID:</strong> {order.order.merchant_id}
              </p>
              <p>
                <strong>Staff:</strong> {order.order.staff_id}
              </p>
            </div>
            <div>
              <p>
                <strong>Order Date:</strong> {formatTimestamp(order.order.date)}
              </p>
              <p>
                <strong>COD total amount:</strong>{" "}
                {VNDong.format(
                  order.packages.reduce((sum, item) => sum + item.cod_cost, 0),
                )}
              </p>
              <p>
                <strong>Shipping revenue amount:</strong>{" "}
                {VNDong.format(
                  order.packages.reduce(
                    (sum, item) => sum + item.shipping_cost,
                    0,
                  ),
                )}
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="flex items-center gap-2">
          <Box /> Packages
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Package ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.packages.map((pkg, idx) => (
              <TableRow key={pkg.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{pkg.id.slice(0, 8)}...</TableCell>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>{pkg.weight.toFixed(2)} kg</TableCell>
                <TableCell>
                  {pkg.width} x {pkg.length} x {pkg.height}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/${role}/packages/${pkg.id}`}>
                      <Button variant="secondary">View Details</Button>
                    </Link>

                    {role == "staff" && handleDeletePackage && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
