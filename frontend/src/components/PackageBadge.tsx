import { Badge } from "@/components/ui/badge";

export default function PackageBadge({ badge_name }: { badge_name: string }) {
  //console.log(badge_name);

  if (badge_name === "DELIVERED") {
    return <Badge variant="default">Delivered</Badge>;
  }
  if (badge_name === "ORDERED") {
    return <Badge variant="outline">Ordered</Badge>;
  }
  if (badge_name === "DELIVERING") {
    return <Badge variant="secondary">Delivering</Badge>;
  }
  if (badge_name === "CANCELLED") {
    return <Badge className="bg-amber-600 hover:bg-amber-700">Cancelled</Badge>;
  }
  if (badge_name === "MISSING") {
    return <Badge variant="destructive">Missing</Badge>;
  }
  return <Badge>???</Badge>;
}
