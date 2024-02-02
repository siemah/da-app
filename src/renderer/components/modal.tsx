import { ComponentProps, FormEvent, ReactNode, forwardRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogContent,
} from '@/renderer/components/ui/alert-dialog';
import { Button } from './ui/button';

interface ModalProps extends ComponentProps<'div'> {
  show: boolean;
  header: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  onClose: () => void;
  onConfirm: (event: FormEvent<HTMLFormElement>) => void;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ header, description, children, icon, show, onClose, onConfirm }, ref) => {
    return (
      <AlertDialog open={show}>
        <AlertDialogContent ref={ref}>
          <div className="absolute flex gap-2 top-4 left-4">
            <Button
              className="w-4 p-0 h-4 rounded-full"
              variant="destructive"
              onClick={onClose}
            />
            <Button className="w-4 p-0 h-4 rounded-full bg-slate-300" />
            <Button className="w-4 p-0 h-4 rounded-full bg-slate-300" />
          </div>
          <form className="flex flex-col gap-4" onSubmit={onConfirm}>
            <AlertDialogHeader className="flex flex-col gap-10">
              <div className="flex flex-col gap-4 items-center">
                {icon}
                <AlertDialogTitle className="text-center">
                  {header}
                </AlertDialogTitle>
                <AlertDialogDescription className="max-w-[80%] text-center">
                  {description}
                </AlertDialogDescription>
              </div>
              <div className="flex flex-row gap-4 w-full">{children}</div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="rounded-lg px-14 py-2 h-9 bg-slate-300 focus-visible:ring-slate-500"
                onClick={onClose}
              >
                Casncel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="rounded-lg px-14 py-2 h-9 bg-blue-500 hover:bg-blue-400 focus-visible:ring-blue-500"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

export default Modal;
