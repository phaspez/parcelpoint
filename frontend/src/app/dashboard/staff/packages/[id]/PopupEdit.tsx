import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormEventHandler, useState } from "react";
import { Package } from "@/types/packages";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageHistoryCreate } from "@/app/dashboard/staff/packages/data";
import { Pencil } from "lucide-react";

interface PopupEditProps {
  editedPackage: Package;
  setEditedPackage: (newPackage: Package) => void;
  handleUpdatePackage: (history: PackageHistoryCreate) => Promise<void>;
}

export default function PopupEdit({
  editedPackage,
  setEditedPackage,
  handleUpdatePackage,
}: PopupEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [historyAction, setHistoryAction] = useState<PackageHistoryCreate>({
    action: `Modify Order ${editedPackage.id.slice(0, 8)}`,
    notes: `Update package details`,
    package_id: editedPackage.id,
    staff_id: "",
  });

  const handleSubmit = () => {
    handleUpdatePackage(historyAction).then(() => setIsEditing(false));
  };

  return (
    <Dialog
      aria-describedby={"desc"}
      open={isEditing}
      onOpenChange={setIsEditing}
    >
      <DialogTrigger asChild>
        <Button variant="default" onClick={() => setIsEditing(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-description={"Update Package"}
        aria-describedby={"Update Package"}
        className="sm:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Edit Package Details</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {editedPackage && (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              handleSubmit();
            }}
          >
            <div className="grid gap-4 py-4">
              <h5>Basic information</h5>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Package Name
                </Label>
                <Input
                  id="name"
                  value={editedPackage.name}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={editedPackage.description}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Status
                </Label>
                <Select
                  value={editedPackage.status}
                  onValueChange={(v) =>
                    setEditedPackage({ ...editedPackage, status: v })
                  }
                >
                  <SelectTrigger className="w-[180px]">
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

              <Separator />
              <h5>Metrics</h5>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={editedPackage.weight}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      weight: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="flex grid-cols-4 items-center gap-4">
                <Label htmlFor="width" className="text-right">
                  Width
                </Label>
                <Input
                  id="width"
                  type="number"
                  step={0.01}
                  min={2}
                  value={editedPackage.width}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      width: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
                <Label htmlFor="length" className="text-right">
                  Length
                </Label>
                <Input
                  id="length"
                  type="number"
                  step={0.01}
                  min={2}
                  value={editedPackage.length}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      length: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
                <Label htmlFor="height" className="text-right">
                  Height
                </Label>
                <Input
                  id="height"
                  type="number"
                  step={0.01}
                  min={2}
                  value={editedPackage.height}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      height: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shipping-cost" className="text-right">
                  Shipping Cost
                </Label>
                <Input
                  id="shipping-cost"
                  type="number"
                  value={editedPackage.shipping_cost}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      shipping_cost: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cod" className="text-right">
                  COD cost
                </Label>
                <Input
                  id="cod-cost"
                  type="number"
                  step={1}
                  min={1000}
                  value={editedPackage.cod_cost}
                  onChange={(e) =>
                    setEditedPackage({
                      ...editedPackage,
                      cod_cost: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <Separator />
              <h5>Update notes</h5>
              <span className="px-0 py-0 text-sm">
                Include messages about why do you update this
              </span>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="action" className="text-right">
                  Action
                </Label>
                <Input
                  id="action"
                  type="text"
                  minLength={1}
                  value={historyAction.action}
                  onChange={(e) =>
                    setHistoryAction({
                      ...historyAction,
                      action: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  type="text"
                  minLength={1}
                  value={historyAction.notes}
                  onChange={(e) =>
                    setHistoryAction({
                      ...historyAction,
                      notes: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
