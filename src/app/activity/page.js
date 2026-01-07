'use client';

import React from 'react';
import ActivityLog from '@/components/ActivityLog';
import { useActivityLog } from '@/context/ActivityLogContext';

export default function ActivityPage() {
    const { activities } = useActivityLog();

    return (
        <ActivityLog activities={activities} />
    );
}
