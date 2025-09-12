"use server";

import {
  analyzeDashboardTrends,
  type AnalyzeDashboardTrendsOutput,
} from "@/ai/flows/analyze-dashboard-trends";

export async function getTrendAnalysis(): Promise<AnalyzeDashboardTrendsOutput> {
  const input = {
    totalRevenue: 45231,
    revenueLastMonth: 40205,
    occupiedRooms: 85,
    totalRooms: 120,
    occupiedRoomsLastMonth: 80,
    activeGuests: 203,
    activeGuestsLastMonth: 188,
    restaurantOrders: 47,
    restaurantOrdersLastMonth: 41,
  };

  const result = await analyzeDashboardTrends(input);
  return result;
}
