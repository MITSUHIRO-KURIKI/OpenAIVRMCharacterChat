// ダイアログが開いているか判定
export function isDialogOpenInDOM(): boolean {
  const dialog = document.querySelector('[role="dialog"][data-state="open"]');
  return Boolean(dialog);
};