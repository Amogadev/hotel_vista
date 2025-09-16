
'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Box,
  Plus,
  Search,
  Filter,
  Settings,
  Trash2,
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StockReport, type StockItem } from './stock-report';
import { AddStockItemModal, StockItemFormValues } from './add-stock-item-modal';
import { useToast } from '@/hooks/use-toast';

const initialStockItems: StockItem[] = [
  {
    name: 'Bath Towels',
    category: 'Linens',
    current: 15,
    min: 25,
    max: 100,
    unit: 'pieces',
    supplier: 'Hotel Supplies Co.',
    status: 'critical',
  },
  {
    name: 'Toilet Paper',
    category: 'Bathroom',
    current: 45,
    min: 30,
    max: 200,
    unit: 'rolls',
    supplier: 'Clean Supply Inc.',
    status: 'low',
  },
  {
    name: 'Bed Sheets',
    category: 'Linens',
    current: 8,
    min: 20,
    max: 80,
    unit: 'sets',
    supplier: 'Hotel Supplies Co.',
    status: 'critical',
  },
  {
    name: 'Hand Soap',
    category: 'Bathroom',
    current: 35,
    min: 15,
    max: 60,
    unit: 'bottles',
    supplier: 'Clean Supply Inc.',
    status: 'normal',
  },
  {
    name: 'Coffee Pods',
    category: 'Room Service',
    current: 120,
    min: 50,
    max: 300,
    unit: 'pods',
    supplier: 'Beverage Direct',
    status: 'normal',
  },
  {
    name: 'Vacuum Bags',
    category: 'Cleaning',
    current: 5,
    min: 10,
    max: 50,
    unit: 'pieces',
    supplier: 'Clean Supply Inc.',
    status: 'critical',
  },
];

const statusVariantMap: { [key: string]: 'destructive' | 'default' | 'outline' } = {
  critical: 'destructive',
  low: 'default',
  normal: 'outline',
};

const statusColorMap: { [key: string]: string } = {
  critical: 'bg-red-400 text-red-950 border-red-500',
  low: 'bg-yellow-400 text-yellow-950 border-yellow-500',
  normal: 'bg-blue-400 text-blue-950 border-blue-500',
};

const progressColorMap: { [key: string]: string } = {
    critical: 'bg-red-500',
    low: 'bg-yellow-500',
    normal: 'bg-primary'
  };

const categories = ['All', 'Linens', 'Bathroom', 'Room Service', 'Cleaning'];

export default function StockManagementDashboard() {
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Stock Report</title></head><body><div id="report-root"></div></body></html>');
      printWindow.document.close();
      
      const reportRoot = printWindow.document.getElementById('report-root');
      if (reportRoot) {
        import('react-dom/client').then(ReactDOM => {
          const style = document.createElement('style');
          style.innerHTML = `
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
            @media print {
              body {
                margin: 1.5rem;
              }
              .no-print {
                display: none;
              }
            }
          `;
          printWindow.document.head.appendChild(style);
          
          const root = ReactDOM.createRoot(reportRoot);
          root.render(<StockReport items={stockItems} />);
          
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        });
      }
    }
  };

  const handleOpenAddItemModal = () => setIsAddItemModalOpen(true);
  const handleCloseAddItemModal = () => setIsAddItemModalOpen(false);

  const handleItemAdded = (newItemData: StockItemFormValues) => {
    const getStatus = (current: number, min: number): 'critical' | 'low' | 'normal' => {
      if (current < min) return 'critical';
      if (current < min * 1.2) return 'low';
      return 'normal';
    };

    const newItem: StockItem = {
      ...newItemData,
      status: getStatus(newItemData.current, newItemData.min),
    };
    setStockItems(prevItems => [newItem, ...prevItems].sort((a,b) => a.name.localeCompare(b.name)));
    handleCloseAddItemModal();
  };

  const handleEditItem = (itemName: string) => {
    toast({ title: "Edit Item", description: `Edit functionality for ${itemName} is not yet implemented.` });
  };

  const handleRemoveItem = (itemName: string) => {
    toast({ title: "Remove Item", description: `Remove functionality for ${itemName} is not yet implemented.` });
  };

  const filteredStockItems = useMemo(() => {
    let items = stockItems;

    if (activeFilter !== 'All') {
      items = items.filter(item => item.category === activeFilter);
    }

    if (searchTerm) {
      items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return items;
  }, [activeFilter, searchTerm, stockItems]);

  const stats = useMemo(() => {
    return [
      {
        title: 'Critical Stock',
        value: stockItems.filter(i => i.status === 'critical').length.toString(),
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      },
      {
        title: 'Low Stock',
        value: stockItems.filter(i => i.status === 'low').length.toString(),
        icon: <TrendingDown className="h-6 w-6 text-yellow-500" />,
      },
      {
        title: 'Total Items',
        value: stockItems.length.toString(),
        icon: <Box className="h-6 w-6 text-blue-500" />,
      },
    ];
  }, [stockItems]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">
            Monitor inventory levels and manage supplies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Box className="mr-2 h-4 w-4" />
            Stock Report
          </Button>
          <Button onClick={handleOpenAddItemModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
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
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stock items..." 
                className="pl-10 w-full md:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map(category => (
                <Button 
                  key={category} 
                  variant={activeFilter === category ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                </Button>
              ))}
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {filteredStockItems.map((item) => {
            const stockPercentage = (item.current / item.max) * 100;
            return (
                <Card key={item.name}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className='text-lg font-bold'>{item.name}</CardTitle>
                            <CardDescription>{item.category}</CardDescription>
                        </div>
                        <Badge variant={statusVariantMap[item.status]} className={statusColorMap[item.status]}>
                            {item.status}
                        </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-bold">{item.current} {item.unit}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-bold">{item.min} {item.unit}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-bold">{item.max} {item.unit}</p>
                        </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Stock Level</span>
                                <span>{stockPercentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={stockPercentage} className="h-2 [&>div]:bg-primary" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Supplier</p>
                                <p className="font-semibold">{item.supplier}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItem(item.name)}>
                                    <Settings />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemoveItem(item.name)}>
                                    <Trash2 />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        })}
      </div>
       <AddStockItemModal
        isOpen={isAddItemModalOpen}
        onClose={handleCloseAddItemModal}
        onItemAdded={handleItemAdded}
      />
    </div>
  );
}
