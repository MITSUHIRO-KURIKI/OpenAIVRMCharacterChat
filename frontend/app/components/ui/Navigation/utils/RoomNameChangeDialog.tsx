'use client'

// react
import {
  useState,
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
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
import { Button } from '@/app/components/ui/shadcn/button';
import { Input } from '@/app/components/ui/shadcn/input';
import { Label } from '@/app/components/ui/shadcn/label';
// icons
import { Loader2 } from 'lucide-react';
// features
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// type
import {
  roomSettingsRoomNameChangeSchema as vrmChatRoomSettingsRoomNameChangeSchema,
} from '@/features/api/vrmchat';


// type
type RoomNameChangeDialogProps = {
  onSubmit:                 ({roomId, newRoomName}
                            :{roomId: string, newRoomName: string}
                            ) => Promise<void>;
  isSending:                boolean;
  roomNameSchema:           typeof vrmChatRoomSettingsRoomNameChangeSchema;
  editRoomName:             string;
  setEditRoomName:          Dispatch<SetStateAction<string>>;
  editRoomNametargetRoomId: string;
  modalOpen:                boolean;
  setModalOpen:             Dispatch<SetStateAction<boolean>>;
};

// RoomNameChangeDialog ▽
export function RoomNameChangeDialog({
  onSubmit,
  isSending,
  roomNameSchema,
  editRoomName,
  setEditRoomName,
  editRoomNametargetRoomId,
  modalOpen,
  setModalOpen, }: RoomNameChangeDialogProps): ReactElement {

  const [errorMsg, setErrorMsg] = useState<string>('');

  // - useCommonSubmit
  const preHandleSubmit = async (e: MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!editRoomName || !editRoomNametargetRoomId) return;

    // valid
    const result = roomNameSchema.safeParse({room_name: editRoomName,});
    if (!result.success) {
      showToast('error', 'error');
      setErrorMsg(result.error.errors[0].message);
      return;
    };

    await onSubmit({
      roomId:       editRoomNametargetRoomId,
      newRoomName:  sanitizeDOMPurify(editRoomName),
    });
  };

  return (
    <Dialog open         = {modalOpen}
            onOpenChange = {setModalOpen}>
      <DialogContent className='bg-sidebar'>
        <DialogHeader>
          <DialogTitle className='sr-only'>
            Change room name
          </DialogTitle>
          <DialogDescription className='sr-only'>
            You can change the room name
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor   = 'roomName'
               className = 'mb-1 block text-sm font-medium'>
          Change room name
        </Label>
        {/* Alert */}
        { errorMsg && (
          <Alert variant   = 'destructive'
                 className = 'mb-2'>
            <AlertDescription>
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}
        <Input id       = 'roomName'
               name     = 'roomName'
               value    = {editRoomName}
               onChange = {(e: ChangeEvent<HTMLInputElement>) => setEditRoomName(e.target.value)}
               required />

        <DialogFooter>
          <Button variant='outline' onClick={() => setModalOpen(false)}>
            cancel
          </Button>
          <Button onClick  = {(e: MouseEvent<HTMLElement>) => preHandleSubmit(e)}
                  disabled = {isSending} >
            {isSending ? (<Loader2 className='animate-spin' />) : ('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};
// RoomNameChangeDialog △