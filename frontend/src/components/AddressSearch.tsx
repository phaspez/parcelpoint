"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce, useDebouncedCallback } from "use-debounce";

interface AddressSuggestion {
  id: string;
  province: string;
  district: string;
  commune: string;
}

interface AddressSearchProps {
  onAddressSelectAction: (addressId: string) => void;
  selectedAddressId: string | undefined; // Make this optional
}

export function AddressSearch({
  onAddressSelectAction,
  selectedAddressId = "", // Provide default value
}: AddressSearchProps) {
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [addressSearch, setAddressSearch] = useState("");
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);

  // Fetch selected address on mount and when selectedAddressId changes
  useEffect(() => {
    const fetchSelectedAddress = async () => {
      if (selectedAddressId) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/v1/address/${selectedAddressId}`,
          );
          if (!response.ok) throw new Error("Failed to fetch address");
          const data = await response.json();
          setSelectedAddress(data);
        } catch (error) {
          console.error("Error fetching address:", error);
          setSelectedAddress(null);
        }
      } else {
        setSelectedAddress(null);
      }
    };

    fetchSelectedAddress();
  }, [selectedAddressId]);

  const searchAddress = async () => {
    if (addressSearch.length > 2) {
      try {
        console.log("fetching ", addressSearch);
        const response = await fetch(
          `http://localhost:8000/api/v1/address/search?q=${encodeURIComponent(addressSearch)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const data = await response.json();
        console.log(data);
        setAddressSuggestions(data);
        console.log(addressSuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setAddressSuggestions([]);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  const debouncedSearchAddress = useDebouncedCallback(searchAddress, 500);

  return (
    <Popover
      open={isAddressPopoverOpen}
      onOpenChange={(open) => {
        setIsAddressPopoverOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !selectedAddressId && "text-muted-foreground",
          )}
        >
          {selectedAddress
            ? `${selectedAddress.commune}, ${selectedAddress.district}, ${selectedAddress.province}`
            : "Select address"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search address..."
            className="h-9"
            value={addressSearch}
            onValueChange={(value) => {
              setAddressSearch(value);
              debouncedSearchAddress();
            }}
          />
          <CommandList>
            {addressSuggestions.length > 0 ? (
              addressSuggestions.map((address) => (
                <CommandItem
                  value={address.id}
                  key={address.id}
                  onSelect={() => {
                    onAddressSelectAction(address.id);
                    setSelectedAddress(address);
                    setIsAddressPopoverOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      address.id === selectedAddressId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {address.commune}, {address.district}, {address.province}
                </CommandItem>
              ))
            ) : (
              <CommandEmpty>Not found</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
