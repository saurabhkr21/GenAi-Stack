import { type ReactNode, type CSSProperties } from 'react';
import { Handle, type HandleProps } from 'reactflow';
import { Settings } from 'lucide-react';

interface CustomHandleProps extends HandleProps {
    style?: CSSProperties;
}

interface BaseNodeProps {
    label: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
    handles?: CustomHandleProps[];
    selected?: boolean;
    className?: string; // Additional classes for the node
    onSettingsClick?: () => void;
    contentClassName?: string;
}

export const BaseNode = ({ label, description, icon, children, handles = [], selected, className = "", onSettingsClick, contentClassName = "" }: BaseNodeProps) => {
    return (
        <div className={`min - w - [300px] bg - card border rounded - lg shadow - sm transition - all duration - 200 ${selected ? 'border-primary shadow-md ring-1 ring-primary' : 'border-border'} ${className} `}>
            {/* Handles */}
            {handles.map((handle, index) => (
                <Handle
                    key={index}
                    type={handle.type}
                    position={handle.position}
                    id={handle.id}
                    className={`w-3 h-3 bg-primary border-2 border-background`}
                    style={handle.style}
                />
            ))}

            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 rounded-t-lg">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-foreground">{icon}</div>}
                    <div className="font-semibold text-sm text-foreground">{label}</div>
                </div>
                <Settings
                    size={16}
                    className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={onSettingsClick}
                />
            </div>

            {/* Description Sub-header */}
            {description && (
                <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-b border-border">
                    {description}
                </div>
            )}

            {/* Content */}
            <div className={`p-4 space-y-4 ${contentClassName}`}>
                {children}
            </div>
        </div>
    );
};
