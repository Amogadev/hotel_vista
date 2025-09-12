"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { getTrendAnalysis } from "@/app/actions";
import type { AnalyzeDashboardTrendsOutput } from "@/ai/flows/analyze-dashboard-trends";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatCard } from "./stat-card";

import {
  DollarSign,
  BedDouble,
  Users,
  UtensilsCrossed,
  Wine,
  Box,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

const activityItems = [
  {
    icon: <BedDouble className="h-5 w-5" />,
    description: "Room 204 checked in",
  },
  {
    icon: <UtensilsCrossed className="h-5 w-5" />,
    description: "Restaurant order #1247",
  },
  {
    icon: <Wine className="h-5 w-5" />,
    description: "Bar sale – Premium Whiskey",
  },
  {
    icon: <Box className="h-5 w-5" />,
    description: "Stock alert: Low towels",
  },
];

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<AnalyzeDashboardTrendsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAnalyzeTrends = () => {
    startTransition(async () => {
      try {
        const result = await getTrendAnalysis();
        setAnalysis(result);
      } catch (error) {
        console.error("Failed to analyze trends:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not retrieve AI-powered insights. Please try again later.",
        });
      }
    });
  };
  
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      trend: "+12.5% from last month",
      trendColor: "text-green-600",
      icon: <DollarSign className="h-5 w-5" />,
      isAnomalous: analysis?.isAnomalousRevenueTrend,
    },
    {
      title: "Occupied Rooms",
      value: "85 / 120",
      trend: "+6.3% from last month",
      trendColor: "text-blue-600",
      icon: <BedDouble className="h-5 w-5" />,
      isAnomalous: analysis?.isAnomalousOccupancyTrend,
    },
    {
      title: "Active Guests",
      value: "203",
      trend: "+8.2% from last month",
      trendColor: "text-orange-600",
      icon: <Users className="h-5 w-5" />,
      isAnomalous: analysis?.isAnomalousGuestTrend,
    },
    {
      title: "Restaurant Orders",
      value: "47",
      trend: "+15.3% from last month",
      trendColor: "text-yellow-600",
      icon: <UtensilsCrossed className="h-5 w-5" />,
      isAnomalous: analysis?.isAnomalousRestaurantOrderTrend,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <header className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        {analysis?.insights && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle className="font-headline">AI-Powered Insights</AlertTitle>
            <AlertDescription>{analysis.insights}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col items-center justify-center bg-primary text-primary-foreground p-6">
              <CardTitle className="text-center font-headline text-2xl">Revenue Trends</CardTitle>
              <CardContent className="flex flex-1 items-center justify-center p-0 pt-4">
                <p className="text-center text-lg">Chart Coming Soon</p>
              </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
