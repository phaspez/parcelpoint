"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  CreateShipmentRate,
  postShipmentRate,
} from "@/app/dashboard/staff/shipping/shipment-rate.service";

const defaultNewRate: CreateShipmentRate = {
  name: "",
  base_rate: 0,
  base_weight: 0,
  oversize_rate: 0,
  overweight_rate_per_kg: 0,
  fragile_rate: 0,
  urgent_rate: 0,
};

interface AddShipmentRateDialogProps {
  onRateAdded: () => void;
}

export default function AddShipmentRateDialog({
  onRateAdded,
}: AddShipmentRateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRate, setNewRate] = useState<CreateShipmentRate>({
    ...defaultNewRate,
  });
  const { toast } = useToast();

  const handleInputChange = (
    field: keyof CreateShipmentRate,
    value: string,
  ) => {
    setNewRate({
      ...newRate,
      [field]: field === "name" ? value : parseFloat(value),
    });
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await postShipmentRate(newRate);
      setIsOpen(false);
      setNewRate({ ...defaultNewRate });
      onRateAdded();
      toast({
        title: "Success",
        description: `New shipping rate "${newRate.name}" has been added.`,
      });
    } catch (err) {
      console.error(err);
      setIsOpen(false); // Close dialog on error too
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new shipment rate. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Shipping Option
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Shipment Rate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-shipment-name" className="text-right">
                Shipment Name
              </Label>
              <Input
                id="new-shipment-name"
                type="text"
                className="col-span-3"
                value={newRate.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-base-rate" className="text-right">
                Base Rate
              </Label>
              <Input
                id="new-base-rate"
                type="number"
                className="col-span-3"
                value={newRate.base_rate}
                onChange={(e) => handleInputChange("base_rate", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-base-weight" className="text-right">
                Base Weight (kg)
              </Label>
              <Input
                id="new-base-weight"
                type="number"
                className="col-span-3"
                value={newRate.base_weight}
                onChange={(e) =>
                  handleInputChange("base_weight", e.target.value)
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-oversize-rate" className="text-right">
                Oversize Rate
              </Label>
              <Input
                id="new-oversize-rate"
                type="number"
                className="col-span-3"
                value={newRate.oversize_rate}
                onChange={(e) =>
                  handleInputChange("oversize_rate", e.target.value)
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-overweight-rate" className="text-right">
                Overweight Rate
              </Label>
              <Input
                id="new-overweight-rate"
                type="number"
                className="col-span-3"
                value={newRate.overweight_rate_per_kg}
                onChange={(e) =>
                  handleInputChange("overweight_rate_per_kg", e.target.value)
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-fragile-rate" className="text-right">
                Fragile Rate
              </Label>
              <Input
                id="new-fragile-rate"
                type="number"
                className="col-span-3"
                value={newRate.fragile_rate}
                onChange={(e) =>
                  handleInputChange("fragile_rate", e.target.value)
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-urgent-rate" className="text-right">
                Urgent Rate
              </Label>
              <Input
                id="new-urgent-rate"
                type="number"
                className="col-span-3"
                value={newRate.urgent_rate}
                onChange={(e) =>
                  handleInputChange("urgent_rate", e.target.value)
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="ml-2"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
