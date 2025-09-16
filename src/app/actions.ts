
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

export async function addRoom(newRoom: {
  number: string;
  type: string;
  price: number;
  status: string;
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}) {
  console.log("Adding new room:", newRoom);
  // This is a mock implementation. In a real app, you'd save to a database.
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, room: newRoom };
}

export async function updateRoom(updatedRoom: {
  originalNumber: string;
  number: string;
  type: string;
  price: number;
  status: string;
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}) {
  console.log("Updating room:", updatedRoom);
  // This is a mock implementation. In a real app, you'd update in a database.
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, room: updatedRoom };
}
