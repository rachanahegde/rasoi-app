'use client';

import { RecipeProvider } from "./RecipeContext";
import { ToastProvider } from "./ToastContext";
import { ActivityLogProvider } from "./ActivityLogContext";
import { ThemeProvider } from "./ThemeContext";
import { UserProvider } from "./UserContext";

export function AppProviders({ children }) {
    return (
        <ThemeProvider>
            <UserProvider>
                <RecipeProvider>
                    <ToastProvider>
                        <ActivityLogProvider>
                            {children}
                        </ActivityLogProvider>
                    </ToastProvider>
                </RecipeProvider>
            </UserProvider>
        </ThemeProvider>
    );
}
