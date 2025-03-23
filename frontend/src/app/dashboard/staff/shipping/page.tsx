"use client";

import React, { useEffect, useState } from "react";
import {
  ShipmentRate,
  fetchShipmentRates,
  patchShipmentRate,
} from "./shipment-rate.service";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Truck, Edit } from "lucide-react";
import { VNDong } from "@/lib/regionFormat";
import AddShipmentRateDialog from "@/app/dashboard/staff/shipping/NewRate";

export default function ShipmentOptions() {
  const [shipmentRates, setShipmentRates] = useState<ShipmentRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShipmentRate | null>(null);
  const { toast } = useToast();

  const loadShipmentRates = async () => {
    try {
      const rates = await fetchShipmentRates();
      setShipmentRates(rates);
    } catch (err) {
      console.error(err);
      setError("Failed to load shipment rates");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shipment rates",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipmentRates();
  }, [toast]);

  const handleEditClick = (rate: ShipmentRate) => {
    setSelectedRate(rate);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedRate) {
      try {
        await patchShipmentRate(selectedRate.id, selectedRate);
        setIsDialogOpen(false); // Close dialog on success
        await loadShipmentRates(); // Reload rates
        toast({
          title: "Success",
          description: `Shipping rate "${selectedRate.name}" has been updated.`,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to update shipment rate");
        setIsDialogOpen(false); // Close dialog on error too
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update shipment rate. Please try again.",
        });
      }
    }
  };

  const handleRateAdded = async () => {
    await loadShipmentRates();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/staff"]}
        breadcrumbPage={["Dashboard"]}
        currentPage="Shipping Options"
      />

      <div className="flex items-center flex-wrap gap-2 mb-6">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Shipping Options</h1>
        <span className="grow" />
        <AddShipmentRateDialog onRateAdded={handleRateAdded} />
        <div className="hidden md:block">
          <Truck size={64} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Base Weight</TableHead>
              <TableHead>Oversize Rate</TableHead>
              <TableHead>Overweight Rate per Kg</TableHead>
              <TableHead>Fragile Rate</TableHead>
              <TableHead>Urgent Rate</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipmentRates.map((rate) => (
              <TableRow key={rate.name}>
                <TableCell className="font-medium">{rate.name}</TableCell>
                <TableCell>{VNDong.format(rate.base_rate)}</TableCell>
                <TableCell>{rate.base_weight} kg</TableCell>
                <TableCell>{VNDong.format(rate.oversize_rate)}</TableCell>
                <TableCell>
                  {VNDong.format(rate.overweight_rate_per_kg)}
                </TableCell>
                <TableCell>{VNDong.format(rate.fragile_rate)}</TableCell>
                <TableCell>{VNDong.format(rate.urgent_rate)}</TableCell>
                <TableCell>
                  <Button size="icon" onClick={() => handleEditClick(rate)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shipment Rate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shipment-name" className="text-right">
                  Shipment Name
                </Label>
                <Input
                  id="shipment-name"
                  type="text"
                  className="col-span-3"
                  value={selectedRate?.name}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            name: e.target.value,
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="base-rate" className="text-right">
                  Base Rate
                </Label>
                <Input
                  id="base-rate"
                  type="number"
                  className="col-span-3"
                  value={selectedRate?.base_rate}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            base_rate: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="base-weight" className="text-right">
                  Base Weight (kg)
                </Label>
                <Input
                  id="base-weight"
                  type="number"
                  className="col-span-3"
                  value={selectedRate?.base_weight}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            base_weight: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="oversize-rate" className="text-right">
                  Oversize Rate
                </Label>
                <Input
                  id="oversize-rate"
                  type="number"
                  className="col-span-3"
                  value={selectedRate?.oversize_rate}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            oversize_rate: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="overweight-rate" className="text-right">
                  Overweight Rate
                </Label>
                <Input
                  id="overweight-rate"
                  type="number"
                  className="col-span-3"
                  value={selectedRate?.overweight_rate_per_kg}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            overweight_rate_per_kg: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fragile-rate" className="text-right">
                  Fragile Rate
                </Label>
                <Input
                  id="fragile-rate"
                  type="number"
                  className="col-span-3"
                  value={selectedRate?.fragile_rate}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            fragile_rate: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="urgent-rate" className="text-right">
                  Urgent Rate
                </Label>
                <Input
                  id="urgent-rate"
                  type="number"
                  className="col-span-3"
                  value={selectedRate?.urgent_rate}
                  onChange={(e) =>
                    setSelectedRate(
                      selectedRate
                        ? {
                            ...selectedRate,
                            urgent_rate: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="ml-2"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
