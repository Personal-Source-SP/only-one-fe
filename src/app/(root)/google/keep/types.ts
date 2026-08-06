export interface Note {
    id: number;
    title: string;
    content: string;
    color: string;
    isPinned: boolean;
    isChecklist: boolean;
    modified: string;
}

export interface ColorPickerProps {
    value: string;
    onSelect: (color: string) => void;
    noteColor?: string;
}
