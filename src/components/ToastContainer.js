'use client';
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
                return <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
            case 'info':
                return <Info className="w-5 h-5 text-secondary flex-shrink-0" />;
            default:
                return <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
        }
    };

    const getColors = () => {
        // Using app theme colors: bg-card (cream), border-border (brown)
        return 'bg-card border-border text-card-foreground';
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
            {/* Sticky note tape effect - using muted (tan) color from palette */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-muted/80 border border-border/30 rotate-1 backdrop-blur-sm shadow-sm"></div>

            <div className="flex items-start gap-3">
                {getIcon()}
                <p className="flex-1 text-sm font-medium font-serif leading-relaxed">
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
