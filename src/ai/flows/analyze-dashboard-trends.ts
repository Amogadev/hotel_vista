'use server';

/**
 * @fileOverview Trend analysis flow for the hotel management dashboard.
 *
 * - analyzeDashboardTrends - Analyzes dashboard trends to identify anomalies.
 * - AnalyzeDashboardTrendsInput - The input type for the analyzeDashboardTrends function.
 * - AnalyzeDashboardTrendsOutput - The return type for the analyzeDashboardTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDashboardTrendsInputSchema = z.object({
  totalRevenue: z.number().describe('Total revenue for the current month.'),
  revenueLastMonth: z.number().describe('Total revenue for the previous month.'),
  occupiedRooms: z.number().describe('Number of occupied rooms for the current month.'),
  totalRooms: z.number().describe('Total number of rooms in the hotel.'),
  occupiedRoomsLastMonth: z.number().describe('Number of occupied rooms last month.'),
  activeGuests: z.number().describe('Number of active guests for the current month.'),
  activeGuestsLastMonth: z.number().describe('Number of active guests last month.'),
  restaurantOrders: z.number().describe('Number of restaurant orders for the current month.'),
  restaurantOrdersLastMonth: z.number().describe('Number of restaurant orders last month.'),
});
export type AnalyzeDashboardTrendsInput = z.infer<typeof AnalyzeDashboardTrendsInputSchema>;

const AnalyzeDashboardTrendsOutputSchema = z.object({
  isAnomalousRevenueTrend: z
    .boolean()
    .describe('Whether the revenue trend is anomalous and requires attention.'),
  isAnomalousOccupancyTrend: z
    .boolean()
    .describe('Whether the occupancy trend is anomalous and requires attention.'),
  isAnomalousGuestTrend: z
    .boolean()
    .describe('Whether the guest trend is anomalous and requires attention.'),
  isAnomalousRestaurantOrderTrend: z
    .boolean()
    .describe('Whether the restaurant order trend is anomalous and requires attention.'),
  insights: z.string().describe('Insights and recommendations based on the trend analysis.'),
});
export type AnalyzeDashboardTrendsOutput = z.infer<typeof AnalyzeDashboardTrendsOutputSchema>;

export async function analyzeDashboardTrends(
  input: AnalyzeDashboardTrendsInput
): Promise<AnalyzeDashboardTrendsOutput> {
  return analyzeDashboardTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDashboardTrendsPrompt',
  input: {schema: AnalyzeDashboardTrendsInputSchema},
  output: {schema: AnalyzeDashboardTrendsOutputSchema},
  prompt: `You are a hotel management expert analyzing monthly trends in key performance indicators.

  Based on the following data, determine if any of the trends are anomalous and require managerial intervention.
  Provide insights and recommendations based on your analysis.

  Total Revenue: {{totalRevenue}} (Previous Month: {{revenueLastMonth}})
  Occupied Rooms: {{occupiedRooms}} / {{totalRooms}} (Previous Month: {{occupiedRoomsLastMonth}})
  Active Guests: {{activeGuests}} (Previous Month: {{activeGuestsLastMonth}})
  Restaurant Orders: {{restaurantOrders}} (Previous Month: {{restaurantOrdersLastMonth}})

  Consider factors such as seasonality, local events, and any known changes in hotel operations.

  Provide your analysis in a structured format, with boolean values indicating whether each trend is anomalous and a summary of your insights.
  Remember, a large change is not necessarily anomalous, especially if the overall values are small.
  A small change in a large number may be anomalous.
`,
});

const analyzeDashboardTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeDashboardTrendsFlow',
    inputSchema: AnalyzeDashboardTrendsInputSchema,
    outputSchema: AnalyzeDashboardTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
