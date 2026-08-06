import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { colorOptions } from '@/app/(root)/google/keep/constants';
import { ColorPickerProps } from '@/app/(root)/google/keep/types';

export const ColorPicker = ({ value, onSelect, noteColor }: ColorPickerProps) => (
    <div
        style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            padding: 8,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
        }}
    >
        {colorOptions.map((color) => (
            <div
                key={color.value}
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '1px solid #eee',
                    background: color.value,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                }}
                title={color.label}
                onClick={() => onSelect(color.value)}
            >
                {(value === color.value || noteColor === color.value) && (
                    <CheckOutlined style={{ color: '#333', fontSize: 16 }} />
                )}
            </div>
        ))}
    </div>
);
