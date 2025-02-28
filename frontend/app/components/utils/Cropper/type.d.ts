export type CropperDialogProps = {
  onCropped:       (file: File) => void;
  className?:      string;
  cropperOptions?: Partial<CropperProps>;
};