'use client';

// react
import {
  useState,
  createRef,
  type ReactElement,
  type ChangeEvent,
  type DragEvent,
} from 'react';
// shadcn
import { cn } from '@/app/components/lib/shadcn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/shadcn/dialog';
import { Button } from '@/app/components/ui/shadcn/button';
import { Input } from '@/app/components/ui/shadcn/input';
// components
import { showToast } from '@/app/components/utils';
// cropper
import Cropper, { type ReactCropperElement, type ReactCropperProps } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
// uuid
import { v4 as uuidv4 } from 'uuid';
// utils
import { getExtensionFromFilename } from '@/features/utils';
// include
import { defaultCropperOptions } from './defaultCropperOptions';
// type
import { CropperDialogProps } from './type.d';


/** DataURL → File */
async function convertDataUrlToFile( dataUrl: string, fileName: string, mimeType: string,): Promise<File> {
  const res  = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: mimeType });
};

export function CropperDialog({ onCropped, className, cropperOptions,}: CropperDialogProps): ReactElement {
  const [isOpen, setIsOpen]         = useState(false);
  const [file, setFile]             = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const cropperRef                  = createRef<ReactCropperElement>();

  // cropperOpts
  // - 外部から書き換え
  //   <CropperDialog cropperOptions={{ aspectRatio: 16 / 9, ...}} />
  const cropperOpts: ReactCropperProps = {
    ...defaultCropperOptions,
    ...cropperOptions,
  };

  // ============ ファイルの選択/確定 ============
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    handlePickedFile(picked);
    e.target.value = '';
  };
  const handlePickedFile = (pickedFile: File) => {
    // SVGは非対応
    if (pickedFile.type === 'image/svg+xml') {
      showToast('error', 'This file format is not supported')
      return;
    };
    setFile(pickedFile);
    setIsOpen(true);
  };

  // ============ ドラッグ＆ドロップ ============
  const handleZoneClick = () => {
    document.getElementById('dropFileInput')?.click();
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    handlePickedFile(dropped);
  };

  // ============ 確定/キャンセル ============
  const handleOk = async () => {
    if (!file || !cropperRef.current) return;
    const canvas  = cropperRef.current.cropper.getCroppedCanvas();
    const mime    = file.type || 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.9);

    const ext      = getExtensionFromFilename(file.name);
    const randName = uuidv4() + ext; // 新ファイル名

    const croppedFile = await convertDataUrlToFile(dataUrl, randName, mime);
    onCropped(croppedFile);
    setIsOpen(false);
    setFile(null);
  };
  const handleCancel = () => {
    setIsOpen(false);
    setFile(null);
  };

  // ============ Cropper Dialog ============
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setFile(null);
    } else {
      if (!file) setIsOpen(false);
    };
  };

  return (
    <>
      {/* input (hidden) */}
      <Input id        = 'dropFileInput'
             type      = 'file'
             accept    = 'image/*'
             className = 'hidden'
             onChange  = {handleFileSelect}/>

      {/* ドロップゾーン (クリックでファイル選択) */}
      <div className = {cn(
            'rounded-md border-2 border-dashed p-6',
            'text-center cursor-pointer select-none transition-colors',
            'hover:border-primary-foreground hover:bg-primary hover:text-primary-foreground',
            isDragOver
             ? 'border-primary-foreground bg-primary text-xs text-primary-foreground'
             : 'border-muted                         text-xs text-muted-foreground',
             className,)}
           onClick     = {handleZoneClick}
           onDragOver  = {handleDragOver}
           onDragLeave = {handleDragLeave}
           onDrop      = {handleDrop} >
        {isDragOver ? (
          <span>drop it here</span>
        ) : (
          <span>select file</span>
        )}
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {isOpen && (
          <DialogContent className='max-h-[90%] overflow-hidden sm:max-w-[600px]'>
            <div className='flex flex-col overflow-auto'>
              <DialogHeader className='mb-2'>
                <DialogTitle className='hidden md:block'>
                  crop image
                </DialogTitle>
                <DialogDescription className='hidden md:block'>
                  Can be adjusted as needed
                </DialogDescription>
              </DialogHeader>

              <div style={{ width: '100%', height: '350px' }}>
                {file && (
                  <Cropper
                    ref   = {cropperRef}
                    src   = {URL.createObjectURL(file)}
                    style = {{ width: '100%', height: '100%' }}
                    {...cropperOpts} />
                )}
              </div>
              <DialogFooter>
                <Button variant   = 'outline'
                        className = 'mt-2'
                        onClick   = {handleCancel}>
                  cancel
                </Button>
                <Button className = 'mt-2'
                        onClick   = {handleOk}>
                  done
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};