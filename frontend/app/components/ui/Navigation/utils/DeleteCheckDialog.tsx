'use client'

// react
import {
  useState,
  useEffect,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
  type ChangeEvent,
} from 'react';
// shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/shadcn/dialog';
import { Input } from '@/app/components/ui/shadcn/input';
import { Button } from '@/app/components/ui/shadcn/button';
import { Label } from '@/app/components/ui/shadcn/label';
// icons
import {
  Loader2,
} from 'lucide-react';
// components
import { showToast } from '@/app/components/utils';


// type
type DeleteCheckDialogDialogProps = {
  onDelete:                ({roomId}: {roomId: string;}) => Promise<void>;
  isSending:               boolean;
  deleteRoomTargetRoomId:  string;
  modalOpen:               boolean;
  setModalOpen:            Dispatch<SetStateAction<boolean>>;
};

// DeleteCheckDialog ▽
export function DeleteCheckDialog({
  onDelete,
  isSending,
  deleteRoomTargetRoomId,
  modalOpen,
  setModalOpen, }: DeleteCheckDialogDialogProps): ReactElement {

  const [safetyCheckInput, setSafetyCheckInput] = useState<string>('');
  const [errorMsg, setErrorMsg]                 = useState<string>('');

  // 初期化
  useEffect(() => {
    if (modalOpen) {
      setSafetyCheckInput('')
      setErrorMsg('')
    };
  }, [modalOpen, setModalOpen])

  // - useCommonSubmit
  const preHandleSubmit = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!deleteRoomTargetRoomId) return;

    // SafetyCheck
    if (safetyCheckInput !== 'delete') {
      showToast('error', 'error');
      setErrorMsg('Type &quot;delete&quot; to perform the deletion');
      return;
    };
    await onDelete({
      roomId: deleteRoomTargetRoomId,
    });
  };

  return (
      <Dialog open         = {modalOpen}
              onOpenChange = {setModalOpen}>
        <DialogContent className='bg-sidebar'>
        <DialogHeader>
          <DialogTitle>
            Do you want to delete the room?
          </DialogTitle>
          <DialogDescription>
            This operation cannot be undone
          </DialogDescription>
        </DialogHeader>

        <div className = 'my-2'>
          { errorMsg ? (
            <p className = 'mb-2 select-none text-sm text-destructive'>
              {errorMsg}
            </p>
          ) : (
            <p className = 'mb-2 select-none text-sm'>
              Please enter &quot;delete&quot;
            </p>
          )}
          <Label htmlFor='safetyCheck' className='sr-only'>check</Label>
          <Input type         = 'text'
                 id           = 'safetyCheck'
                 value        = {safetyCheckInput}
                 onChange     = {(e: ChangeEvent<HTMLInputElement>) => {setSafetyCheckInput(e.target.value);}}
                 placeholder  = 'delete'
                 autoComplete = 'off' />
        </div>

          <DialogFooter className = 'flex !justify-between'>
            <Button variant   = 'destructive'
                    className = 'order-2 mt-2 sm:order-1'
                    onClick   = {(e: MouseEvent<HTMLElement>) => preHandleSubmit(e)}
                    disabled  = {isSending} >
              {isSending ? (<Loader2 className='animate-spin' />) : ('delete')}
            </Button>
            <Button variant   = 'outline'
                    className = 'order-1 mt-2 sm:order-2'
                    onClick   = {() => setModalOpen(false)}>
              cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
};
// DeleteCheckDialog △