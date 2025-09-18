
'use client';

import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addHall } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

const facilitiesList = ['Projector', 'Sound System', 'AC', 'Whiteboard', 'TV'];

const hallSchema = z.object({
  name: z.string().min(1, 'Hall name is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  facilities: z.array(z.string()).min(1, 'At least one facility is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  status: z.enum(['Available', 'Booked', 'Maintenance']),
});

export type HallFormValues = z.infer<typeof hallSchema>;

type AddHallModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onHallAdded: (newHall: HallFormValues & {id: string}) => void;
};

export function AddHallModal({ isOpen, onClose, onHallAdded }: AddHallModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallSchema),
    defaultValues: {
      name: '',
      capacity: 50,
      facilities: [],
      price: 5000,
      status: 'Available',
    },
  });

  const onSubmit = (values: HallFormValues) => {
    startTransition(async () => {
      try {
        const result = await addHall(values);
        if (result.success && result.hall) {
          toast({
            title: 'Hall Added',
            description: `Hall ${values.name} has been successfully added.`,
          });
          onHallAdded({ ...values, id: result.hall.id});
          onClose();
          form.reset();
        } else {
          throw new Error(result.error || 'Failed to add hall');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'Failed to add the hall. Please try again.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Hall</DialogTitle>
          <DialogDescription>
            Enter the details for the new hall.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hall Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hall name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Grand Ballroom">Grand Ballroom</SelectItem>
                      <SelectItem value="Conference Room">Conference Room</SelectItem>
                      <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 200" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price/Hour (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 10000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="facilities"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Facilities</FormLabel>
                    <FormDescription>
                      Select the facilities available in this hall.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                  {facilitiesList.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="facilities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter className="col-span-1 md:col-span-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Hall
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
