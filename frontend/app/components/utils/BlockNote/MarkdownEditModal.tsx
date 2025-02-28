'use client';

// react
import { useState } from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/shadcn/dialog';
import { Button } from '@/app/components/ui/shadcn/button';
// include
import { MarkdownEditorClient } from './MarkdownEditorClient';


// type
type MarkdownEditModalProps = {
  initialMarkdown: string;
  isOpen:          boolean;
  setIsOpen:       (open: boolean) => void;
  onSave:          (updatedMarkdown: string) => void;
};

// MarkdownEditModal
export function MarkdownEditModal({
  initialMarkdown,
  isOpen,
  setIsOpen,
  onSave, }: MarkdownEditModalProps) {

  const [newMarkdown, setNewMarkdown] = useState(initialMarkdown);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn(
          'flex flex-col',
          'size-full sm:size-[95%] md:size-[90%] lg:w-[85%] max-h-full max-w-full',
          'px-0 pt-3 md:px-0 md:pt-7',
          'bg-background',
        )}>
        <DialogHeader className='px-0 sm:px-4'>
          <DialogTitle>
            編集
          </DialogTitle>
          <DialogDescription className='sr-only'>
            Markdown を編集できます
          </DialogDescription>
        </DialogHeader>

        {/* EditorClient */}
        <div className='flex-1 overflow-auto'>
          <MarkdownEditorClient initialMarkdown = {initialMarkdown}
                                onChange        = {(md) => setNewMarkdown(md)} />
        </div>

        <DialogFooter className='px-0 sm:px-4'>
          <Button variant = 'outline'
                  onClick = {() => setIsOpen(false)}>
              cancel
          </Button>
          <Button onClick={() => onSave(newMarkdown)}>
            save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};