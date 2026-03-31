
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { PlusCircle, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), orderBy('name')), [firestore]);
  const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(productsQuery);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(firestore, 'products', productToDelete.id));
      toast({ title: "Product deleted", description: `"${productToDelete.name}" has been removed.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e.message });
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Manage Products</CardTitle>
              <CardDescription>Add, edit, or remove products and manage inventory.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Add Product
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading products...</p>}
          {!isLoading && (
            <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {products?.map(product => (
                      <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>R{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                              <div className="flex items-center gap-2">
                                  <span>{product.stock ?? 0}</span>
                                  {(product.stock ?? 0) <= 5 && (
                                      <Badge variant="destructive" className="h-5 px-1.5 flex gap-1">
                                          <AlertTriangle className="h-3 w-3" /> Low
                                      </Badge>
                                  )}
                              </div>
                          </TableCell>
                          <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/products/${product.id}`}>
                                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setProductToDelete({ id: product.id, name: product.name })}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                  </Button>
                              </div>
                          </TableCell>
                      </TableRow>
                  ))}
                  {!products?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No products yet. Add your first product above.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => { if (!open) setProductToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{productToDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product from the store. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
