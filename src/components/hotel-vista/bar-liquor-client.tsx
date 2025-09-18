
'use client';

import React, { useState, useMemo, useContext, useTransition } from 'react';
import { DataContext, InventoryItem } from '@/context/data-provider';
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  DollarSign,
  Box,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { AddBarProductModal, BarProductFormValues } from './add-bar-product-modal';
import { EditBarProductModal, EditBarProductFormValues } from './edit-bar-product-modal';
import { UpdateStockModal } from './update-stock-modal';
import { deleteBarProduct } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { BarProductCard } from './bar-product-card';
import { BarProductDetailsModal } from './bar-product-details-modal';

const productTypes = ['All', 'Whiskey', 'Vodka', 'Beer', 'Wine', 'Gin', 'Champagne', 'Other'];

export default function BarLiquorManagementDashboard() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { inventoryItems, setInventoryItems } = useContext(DataContext);
  
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [updatingItem, setUpdatingItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const getStatusFromStock = (stock: number): 'good' | 'low' | 'critical' => {
      if (stock < 10) return 'critical';
      if (stock < 20) return 'low';
      return 'good';
  }

  const handleOpenAddProductModal = () => setIsAddProductModalOpen(true);
  const handleCloseAddProductModal = () => setIsAddProductModalOpen(false);
  
  const handleOpenEditProductModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditProductModalOpen(true);
  }
  const handleCloseEditProductModal = () => {
    setEditingItem(null);
    setIsEditProductModalOpen(false);
  }

  const handleOpenUpdateStockModal = (item: InventoryItem) => {
    setUpdatingItem(item);
    setIsUpdateStockModalOpen(true);
  };
  const handleCloseUpdateStockModal = () => {
    setUpdatingItem(null);
    setIsUpdateStockModalOpen(false);
  };

  const handleViewProduct = (item: InventoryItem) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => setIsViewModalOpen(false);

  const handleOpenDeleteAlert = (item: InventoryItem) => {
    setDeletingItem(item);
    setIsDeleteAlertOpen(true);
  }

  const handleProductAdded = (productData: BarProductFormValues) => {
    const newProduct: InventoryItem = {
      ...productData,
      status: getStatusFromStock(productData.stock),
    };
    setInventoryItems(prevItems => [newProduct, ...prevItems].sort((a, b) => a.name.localeCompare(b.name)));
    handleCloseAddProductModal();
  };

  const handleProductUpdated = (updatedProductData: EditBarProductFormValues & { originalName: string }) => {
    setInventoryItems(prevItems => prevItems.map(item =>
        item.name === updatedProductData.originalName
            ? { ...item, ...updatedProductData, status: getStatusFromStock(updatedProductData.stock) }
            : item
    ));
    handleCloseEditProductModal();
  };

  const handleStockUpdated = (productName: string, newStock: number) => {
    setInventoryItems(prevItems => prevItems.map(item =>
        item.name === productName
            ? { ...item, stock: newStock, status: getStatusFromStock(newStock) }
            : item
    ));
    handleCloseUpdateStockModal();
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;

    startTransition(async () => {
        try {
            const result = await deleteBarProduct(deletingItem.name);
            if (result.success) {
                toast({
                    title: "Product Deleted",
                    description: `${deletingItem.name} has been removed from inventory.`,
                });
                setInventoryItems(prevItems => prevItems.filter(i => i.name !== deletingItem.name));
            } else {
                throw new Error(result.error || "Failed to delete product");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the product. Please try again.",
            });
        } finally {
            setIsDeleteAlertOpen(false);
            setDeletingItem(null);
        }
    });
  };

  const handleAction = (action: 'edit' | 'stock' | 'delete', item: InventoryItem) => {
    if (action === 'edit') handleOpenEditProductModal(item);
    if (action === 'stock') handleOpenUpdateStockModal(item);
    if (action === 'delete') handleOpenDeleteAlert(item);
  };

  const filteredItems = useMemo(() => {
    let items = inventoryItems;
    if (activeFilter !== 'All') {
      items = items.filter(item => item.type === activeFilter);
    }
    if (searchTerm) {
      items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return items;
  }, [inventoryItems, activeFilter, searchTerm]);

  const stats = useMemo(() => ([
    {
      title: 'Total Products',
      value: inventoryItems.length.toString(),
      icon: <Box className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Low Stock',
      value: inventoryItems.filter(i => i.status === 'low').length.toString(),
      icon: <TrendingDown className="h-6 w-6 text-yellow-500" />,
    },
    {
      title: 'Critical Stock',
      value: inventoryItems.filter(i => i.status === 'critical').length.toString(),
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
    },
    {
      title: 'Total Stock Value',
      value: `₹${inventoryItems.reduce((acc, i) => acc + i.price * i.stock, 0).toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
    },
  ]), [inventoryItems]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bar & Liquor Management</h1>
          <p className="text-muted-foreground">Track sales and manage liquor inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenAddProductModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="relative flex-1 w-full md:grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by product name..."
              className="w-full rounded-lg bg-background pl-8 md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {productTypes.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter)}
                className="text-xs h-8"
              >
                {filter}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredItems.map((item) => (
                <BarProductCard 
                    key={item.name}
                    item={item} 
                    onView={handleViewProduct}
                    onAction={handleAction}
                />
            ))}
        </div>
      </div>
      
      <AddBarProductModal
        isOpen={isAddProductModalOpen}
        onClose={handleCloseAddProductModal}
        onProductAdded={handleProductAdded}
      />
      {updatingItem && (
        <UpdateStockModal
          isOpen={isUpdateStockModalOpen}
          onClose={handleCloseUpdateStockModal}
          onStockUpdated={handleStockUpdated}
          item={updatingItem}
        />
      )}
      {editingItem && (
        <EditBarProductModal
            isOpen={isEditProductModalOpen}
            onClose={handleCloseEditProductModal}
            onProductUpdated={handleProductUpdated}
            product={editingItem}
        />
      )}
      {viewingItem && (
        <BarProductDetailsModal
          item={viewingItem}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />
      )}
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to remove this product?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove {deletingItem?.name} from your inventory.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingItem(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
