"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  createStorageBlock,
  deleteStorageBlock,
  StorageBlock,
  fetchStorageBlocks,
} from "@/app/dashboard/staff/storage/data";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Clipboard, Check, Trash, Warehouse, Plus } from "lucide-react";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  max_package: z.number().min(1, "Capacity must be at least 1").default(10),
  max_weight: z
    .number()
    .min(1, "Capacity must be at least 100 kg")
    .default(1000),
  max_size: z
    .number()
    .min(1, "Capacity must be at least 1000 cm3")
    .default(10000),
});

export default function StoragePage() {
  const { toast } = useToast();
  const [storageBlocks, setStorageBlocks] = useState<StorageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      max_weight: 100,
      max_package: 10,
      max_size: 1000,
    },
  });

  useEffect(() => {
    fetchStorageBlocks().then((blocks) => {
      setStorageBlocks(blocks);
      setIsLoading(false);
    });
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const newBlock = await createStorageBlock(data);
      setStorageBlocks((prev) => [...prev, newBlock]);
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Storage block created",
        description: "The new storage block has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create storage block. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStorageBlock(id);
      setStorageBlocks((prev) => prev.filter((block) => block.id !== id));
      toast({
        title: "Storage block deleted",
        description: "The storage block has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete storage block. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (id: string) => {
    setCopiedId(id);
    // Reset back to clipboard icon after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container">
      <AutoBreadcrumb
        breadcrumbLink={["/dashboard/staff"]}
        breadcrumbPage={["Dashboard"]}
        currentPage="Storage Management"
      />

      <span className="flex items-center flex-wrap gap-2">
        <SidebarTrigger size="lg" className="aspect-square text-2xl p-5" />
        <h1>Storage Management</h1>
        <span className="grow" />
        <div className="flex justify-end mb-4 pt-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Add Storage Block
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Storage Block</DialogTitle>
                <DialogDescription>
                  Create a new storage block by providing a name and capacity.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Block name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Capacity"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_package"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max package</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Max package"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Volume (cm<sup>3</sup>)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Capacity"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="hidden md:block">
          <Warehouse size={64} />
        </div>
      </span>

      <div className="rounded-md border mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Max Size</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="w-[70px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storageBlocks.map((block, idx) => (
              <TableRow key={block.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-medium">{block.name}</TableCell>
                <TableCell>{block.max_size}</TableCell>
                <TableCell>{block.max_weight}</TableCell>
                <TableCell className="font-mono flex items-center">
                  {block.id}
                  <CopyToClipboard
                    text={block.id}
                    onCopy={() => handleCopy(block.id)}
                  >
                    <Button variant="outline" className="ml-2">
                      {copiedId === block.id ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Clipboard size={16} />
                      )}
                    </Button>
                  </CopyToClipboard>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(block.id)}
                  >
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
