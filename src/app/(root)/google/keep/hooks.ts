'use client';

import { useEffect, useState } from 'react';
import { initialNoteLabels, initialNotes } from './constants';
import { Note } from './types';

export const useGoogleKeepPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [newNoteExpanded, setNewNoteExpanded] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#FFFFFF');

    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [noteLabels, setNoteLabels] = useState<{ [key: number]: string[] }>(initialNoteLabels);
    const [columns, setColumns] = useState(4);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setColumns(1);
            } else if (width < 768) {
                setColumns(2);
            } else if (width < 1024) {
                setColumns(3);
            } else {
                setColumns(4);
            }
        };

        window.addEventListener('resize', updateColumns);
        updateColumns();

        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const filteredNotes = notes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
    const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

    const handleNoteClick = (note: Note) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const handleCreateNote = () => {
        if (newNoteTitle.trim() === '' && newNoteContent.trim() === '') return;

        const newNote: Note = {
            id: Date.now(),
            title: newNoteTitle,
            content: newNoteContent,
            color: selectedColor,
            isPinned: false,
            isChecklist: false,
            modified: 'Vừa xong',
        };

        setNotes([newNote, ...notes]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteExpanded(false);
        setSelectedColor('#FFFFFF');
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setShowColorPicker(false);

        if (selectedNote) {
            setNotes(
                notes.map((note) => (note.id === selectedNote.id ? { ...note, color } : note)),
            );
            setSelectedNote({ ...selectedNote, color });
        }
    };

    const handleRemoveLabel = (noteId: number, label: string) => {
        const currentLabels = noteLabels[noteId] || [];
        setNoteLabels({
            ...noteLabels,
            [noteId]: currentLabels.filter((l) => l !== label),
        });
    };

    const handleDeleteNote = (id: number) => {
        setNotes(notes.filter((note) => note.id !== id));
        if (selectedNote?.id === id) {
            setIsModalOpen(false);
        }
    };

    const handleTogglePin = (id: number) => {
        setNotes(
            notes.map((note) => (note.id === id ? { ...note, isPinned: !note.isPinned } : note)),
        );

        if (selectedNote?.id === id) {
            setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
        }
    };

    return {
        isModalOpen,
        setIsModalOpen,
        searchQuery,
        setSearchQuery,
        selectedNote,
        setSelectedNote,
        newNoteExpanded,
        setNewNoteExpanded,
        newNoteTitle,
        setNewNoteTitle,
        newNoteContent,
        setNewNoteContent,
        showColorPicker,
        setShowColorPicker,
        selectedColor,
        setSelectedColor,
        notes,
        noteLabels,
        setNoteLabels,
        columns,
        pinnedNotes,
        unpinnedNotes,
        handleNoteClick,
        handleCreateNote,
        handleColorSelect,
        handleRemoveLabel,
        handleDeleteNote,
        handleTogglePin,
    };
};
