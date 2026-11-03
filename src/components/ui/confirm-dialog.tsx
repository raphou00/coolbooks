import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/** Body for destructive confirmation modals (delete book, delete account). */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}) => (
    <div className="flex flex-col gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-peach text-navy">
            <AlertTriangle className="size-5" />
        </span>
        <div>
            <h2 className="type-title-lg text-ink pr-10">{title}</h2>
            <p className="type-body mt-2 text-body">{description}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={onCancel}
                className="button-secondary"
            >
                {cancelLabel}
            </button>
            <button
                type="button"
                onClick={onConfirm}
                className="button-primary button-danger"
            >
                {confirmLabel}
            </button>
        </div>
    </div>
);

export default ConfirmDialog;
