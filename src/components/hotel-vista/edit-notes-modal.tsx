
'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setDailyNote } from '@/lib/rooms-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const notesSchema = z.object({
  notes: z.string(),
});

type NotesFormValues = z.infer<typeof notesSchema>;

type EditNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  initialNote: string;
  onNoteUpdated: (newNote: string) => void;
};

export function EditNotesModal({ isOpen, onClose, date, initialNote, onNoteUpdated }: EditNotesModalProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
        notes: initialNote,
    }
  });

  useEffect(() => {
    form.reset({ notes: initialNote });
  }, [initialNote, form]);

  const dateKey = format(date, 'yyyy-MM-dd');
  const formattedDate = format(date, 'MMMM d, yyyy');


  const onSubmit = (values: NotesFormValues) => {
    startTransition(() => {
        setDailyNote(dateKey, values.notes);
        toast({
            title: 'Notes Updated',
            description: `Notes for ${formattedDate} have been saved.`,
        });
        onNoteUpdated(values.notes);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Notes for {formattedDate}</DialogTitle>
          <DialogDescription>
            Add or update special notes, events, or reminders for this day.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Textarea
            {...form.register('notes')}
            placeholder="e.g., VIP guest arriving, Maintenance on pool..."
            className="min-h-[150px]"
          />
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Notes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
