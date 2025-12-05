import React from 'react';
import { 
    BookOpen, 
    Pencil, 
    Sparkles, 
    Tag, 
    ShoppingBasket,
    Clock,
    Plus,
    Trash2
} from 'lucide-react';

const ActivityLog = ({ activities = [] }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'recipe_added':
                return <Plus className="w-4 h-4" />;
            case 'recipe_updated':
                return <Pencil className="w-4 h-4" />;
            case 'recipe_deleted':
                return <Trash2 className="w-4 h-4" />;
            case 'variation_generated':
                return <Sparkles className="w-4 h-4" />;
            case 'tag_added':
                return <Tag className="w-4 h-4" />;
            case 'shopping_list_created':
                return <ShoppingBasket className="w-4 h-4" />;
            default:
                return <BookOpen className="w-4 h-4" />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-6 border-b border-border bg-card">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h1 className="text-3xl font-serif font-bold text-foreground">Activity Log</h1>
                </div>
                <p className="text-muted-foreground font-serif italic">
                    A journal of your culinary adventures
                </p>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activities.length > 0 ? (
                    <div className="max-w-3xl mx-auto relative">
                        {/* Timeline line */}
                        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border"></div>

                        <div className="space-y-6">
                            {activities.map((activity, index) => (
                                <div key={activity.id || index} className="relative pl-12 group">
                                    {/* Timeline marker */}
                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    {/* Activity card */}
                                    <div className="paper-card bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all group-hover:border-primary/30">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <p className="font-serif text-foreground leading-relaxed flex-1">
                                                {activity.message}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTimestamp(activity.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Additional details */}
                                        {activity.details && (
                                            <p className="text-sm text-muted-foreground font-serif italic mt-2">
                                                {activity.details}
                                            </p>
                                        )}

                                        {/* Tags if present */}
                                        {activity.tags && activity.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {activity.tags.map((tag, i) => (
                                                    <span 
                                                        key={i}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 border-2 border-dashed border-border">
                            <BookOpen className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                            Your Journey Begins
                        </h3>
                        <p className="text-muted-foreground font-serif italic max-w-md">
                            Start creating recipes, and your culinary story will unfold here...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
