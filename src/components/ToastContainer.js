import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const Toast = ({ toast }) => {
    const { removeToast } = useToast();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => removeToast(toast.id), 300);
        }, 3700);

        return () => clearTimeout(timer);
    }, [toast.id, removeToast]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => removeToast(toast.id), 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
            default:
                return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
        }
    };

    const getColors = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
        }
    };

    return (
        <div
            className={`
                relative p-4 pr-10 rounded-sm border-2 shadow-lg
                transform transition-all duration-300 ease-out
                ${getColors()}
                ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                hover:shadow-xl
                min-w-[280px] max-w-[400px]
                rotate-1
                sticky-note
            `}
            style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
            }}
        >
            {/* Sticky note tape effect */}
            <div className="
                absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4
                bg-amber-200/80 dark:bg-amber-300/40
                border border-amber-400/60 dark:border-amber-300/30
                rotate-1 backdrop-blur-sm shadow-sm
            "></div>
            
            <div className="flex items-start gap-3">
                {getIcon()}
                <p className="flex-1 text-sm font-medium text-foreground font-serif leading-relaxed">
                    {toast.message}
                </p>
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ToastContainer = () => {
    const { toasts } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
