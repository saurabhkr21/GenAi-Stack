import { BaseNode } from './BaseNode';
import { Position, type NodeProps } from 'reactflow';
import { LogOut } from 'lucide-react';

export const OutputNode = ({ data, selected }: NodeProps) => {
    return (
        <BaseNode
            label="Output"
            description="Output of the result nodes as text"
            icon={<LogOut size={16} className="text-orange-500" />}
            selected={selected}
            onSettingsClick={() => alert("Settings for Output Node")}
            handles={[
                { type: 'target', position: Position.Left, id: 'input' }
            ]}
            contentClassName="pl-10"
        >
            <div className="space-y-1">
                <div className="text-xs font-medium text-foreground">Output Text</div>
                <div className="w-full h-24 bg-muted/20 border border-border rounded-lg p-3 text-sm text-foreground overflow-y-auto">
                    {data.outputValue ? (
                        <span className="whitespace-pre-wrap">{typeof data.outputValue === 'string' ? data.outputValue : JSON.stringify(data.outputValue, null, 2)}</span>
                    ) : (
                        <span className="text-muted-foreground/50 italic">Output will be generated based on query</span>
                    )}
                </div>
            </div>

            {/* Handle Label */}
            <div className="relative h-4">
                <div className="absolute left-0 top-1 text-xs font-medium text-muted-foreground">Output</div>
            </div>
        </BaseNode>
    );
};
