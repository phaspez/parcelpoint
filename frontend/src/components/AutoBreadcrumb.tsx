import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { Home } from "lucide-react";

interface AutoBreadcrumbProps {
  breadcrumbLink: string[];
  breadcrumbPage: string[];
  currentPage?: string;
}

export default function AutoBreadcrumb({
  breadcrumbLink,
  breadcrumbPage,
  currentPage,
}: AutoBreadcrumbProps) {
  if (breadcrumbLink.length !== breadcrumbPage.length) {
    throw new Error("Breadcrumb link and page must have the same length");
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="flex items-center gap-2" href="/">
            <Home size={16} />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbLink.map((link, index) => (
          <Fragment key={link}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={link}>
                {breadcrumbPage[index]}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        {currentPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{currentPage}</BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
