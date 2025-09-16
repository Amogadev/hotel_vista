
'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  BarChart,
  Box,
  TrendingUp,
  Wine,
  Plus,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RecordSaleModal, SaleFormValues } from './record-sale-modal';
import { AddBarProductModal, BarProductFormValues } from './add-bar-product-modal';
import { UpdateStockModal } from './update-stock-modal';

const stats = [
  {
    title: "Today's Sales",
    value: '₹1,245',
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Items Sold',
    value: '67',
    icon: <BarChart className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'Low Stock Items',
    value: '3',
    icon: <Box className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: 'Avg. Sale',
    value: '₹18.60',
    icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
  },
];

const initialInventoryItems = [
  {
    name: 'Premium Whiskey',
    type: 'Whiskey',
    stock: 24,
    price: 15,
    status: 'good',
  },
  {
    name: 'Vodka Premium',
    type: 'Vodka',
    stock: 8,
    price: 12,
    status: 'low',
  },
  {
    name: 'Craft Beer',
    type: 'Beer',
    stock: 48,
    price: 6,
    status: 'good',
  },
  {
    name: 'Red Wine',
    type: 'Wine',
    stock: 16,
    price: 25,
    status: 'good',
  },
  {
    name: 'Gin Tonic',
    type: 'Gin',
    stock: 5,
    price: 10,
    status: 'low',
  },
  {
    name: 'Champagne',
    type: 'Champagne',
    stock: 12,
    price: 40,
    status: 'good',
  },
];

const initialRecentSales = [
  {
    name: 'Premium Whiskey',
    qty: 2,
    room: '204',
    price: 30,
    time: '5 mins ago',
  },
  {
    name: 'Red Wine',
    qty: 1,
    price: 25,
    time: '12 mins ago',
  },
  {
    name: 'Craft Beer',
    qty: 4,
    price: 24,
    time: '18 mins ago',
  },
  {
    name: 'Champagne',
    qty: 1,
    room: '315',
    price: 40,
    time: '25 mins ago',
  },
];

type InventoryItem = {
  name: string;
  type: string;
  stock: number;
  price: number;
  status: 'good' | 'low' | 'critical';
};

const getStatusFromStock = (stock: number): 'good' | 'low' | 'critical' => {
    if (stock < 10) return 'critical';
    if (stock < 20) return 'low';
    return 'good';
}

const statusVariantMap: { [key: string]: 'default' | 'destructive' } = {
  good: 'default',
  low: 'destructive',
  critical: 'destructive'
};

const statusColorMap: { [key: string]: string } = {
    good: 'bg-green-400 text-green-950 border-green-500',
    low: 'bg-yellow-400 text-yellow-950 border-yellow-500',
    critical: 'bg-red-400 text-red-950 border-red-500'
};


export default function BarLiquorManagementDashboard() {
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [recentSales, setRecentSales] = useState(initialRecentSales);
  const [updatingItem, setUpdatingItem] = useState<InventoryItem | null>(null);

  const handleOpenRecordSaleModal = () => setIsRecordSaleModalOpen(true);
  const handleCloseRecordSaleModal = () => setIsRecordSaleModalOpen(false);

  const handleOpenAddProductModal = () => setIsAddProductModalOpen(true);
  const handleCloseAddProductModal = () => setIsAddProductModalOpen(false);

  const handleOpenUpdateStockModal = (item: InventoryItem) => {
    setUpdatingItem(item);
    setIsUpdateStockModalOpen(true);
  };
  const handleCloseUpdateStockModal = () => {
    setUpdatingItem(null);
    setIsUpdateStockModalOpen(false);
  };

  const handleSaleRecorded = (saleData: SaleFormValues) => {
    const selectedItem = inventoryItems.find(item => item.name === saleData.name);
    if (!selectedItem) return;

    const newSale = {
      name: saleData.name,
      qty: saleData.qty,
      price: selectedItem.price * saleData.qty,
      room: saleData.room,
      time: 'Just now',
    };

    setRecentSales(prevSales => [newSale, ...prevSales]);
    
    // Decrease stock
    setInventoryItems(prevItems => prevItems.map(item =>
        item.name === saleData.name
            ? { ...item, stock: item.stock - saleData.qty, status: getStatusFromStock(item.stock - saleData.qty) }
            : item
    ));

    handleCloseRecordSaleModal();
  };

  const handleProductAdded = (productData: BarProductFormValues) => {
    const newProduct: InventoryItem = {
      ...productData,
      status: getStatusFromStock(productData.stock),
    };
    setInventoryItems(prevItems => [newProduct, ...prevItems].sort((a, b) => a.name.localeCompare(b.name)));
    handleCloseAddProductModal();
  };

  const handleStockUpdated = (productName: string, newStock: number) => {
    setInventoryItems(prevItems => prevItems.map(item =>
        item.name === productName
            ? { ...item, stock: newStock, status: getStatusFromStock(newStock) }
            : item
    ));
    handleCloseUpdateStockModal();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bar & Liquor Management</h1>
          <p className="text-muted-foreground">Track sales and manage liquor inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenRecordSaleModal}>
            <Plus className="mr-2 h-4 w-4" />
            Record Sale
          </Button>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wine className="h-6 w-6" />
              <CardTitle className="text-xl font-semibold">Liquor Inventory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryItems.map((item, index) => (
              <React.Fragment key={item.name}>
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <Badge variant={statusVariantMap[item.status]} className={statusColorMap[item.status]}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stock</p>
                        <p className="font-semibold">{item.stock} units</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold text-yellow-600">₹{item.price}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenUpdateStockModal(item)}>Update Stock</Button>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              <CardTitle className="text-xl font-semibold">Recent Sales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSales.map((sale, index) => (
               <React.Fragment key={index}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-semibold">{sale.name}</p>
                        <p className="text-sm text-muted-foreground">
                            Qty: {sale.qty} {sale.room && `| Room ${sale.room}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-green-600">₹{sale.price}</p>
                        <p className="text-sm text-muted-foreground">{sale.time}</p>
                    </div>
                </div>
                {index < recentSales.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
      <RecordSaleModal
        isOpen={isRecordSaleModalOpen}
        onClose={handleCloseRecordSaleModal}
        onSaleRecorded={handleSaleRecorded}
        inventoryItems={inventoryItems}
      />
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
    </div>
  );
}
