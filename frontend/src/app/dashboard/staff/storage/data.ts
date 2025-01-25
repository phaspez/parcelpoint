"use server";

export interface StorageBlockCreate {
  name: string;
  max_weight: number;
  max_size: number;
  max_package: number;
}

export interface StorageBlock extends StorageBlockCreate {
  id: string;
  weight: number;
  size: number;
}

export async function fetchStorageBlocks() {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/storage_block",
    {
      method: "get",
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as StorageBlock[];
}

export async function createStorageBlock(storageBlock: StorageBlockCreate) {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/storage_block",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storageBlock),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function deleteStorageBlock(id: string) {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/storage_block/${id}`,
    {
      method: "delete",
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
