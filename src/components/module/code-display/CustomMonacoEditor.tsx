import { CHEERIO_COMPLETION_ITEMS } from './utils/completion';
import { cheerioTypes } from './utils/type';
import { Editor, useMonaco } from '@monaco-editor/react';
import { debounce } from 'lodash';
import * as monaco from 'monaco-editor';
import { useEffect, useMemo } from 'react';

type CustomMonacoEditorProps = {
    editedCode: string;
    onCodeChange: (value: string) => void;
    language?: 'javascript' | 'html';
};

const MONACO_EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14, // Font size of the editor
    wordWrap: 'on', // Automatically wrap text when it exceeds editor width
    lineNumbers: 'on', // Display line numbers
    formatOnPaste: true, // Automatically format code when pasting
    quickSuggestions: true, // Enable quick code suggestions
    roundedSelection: false, // Disable rounded corners when selecting text
    scrollBeyondLastLine: false, // Prevent scrolling beyond the last line
    suggestOnTriggerCharacters: true, // Show suggestions when typing trigger characters
    minimap: { enabled: false }, // Disable minimap (small map on the right)
    padding: { top: 8, bottom: 8 }, // Add top and bottom padding for the editor
    parameterHints: { enabled: true }, // Enable parameter hints when calling functions
    scrollbar: { vertical: 'hidden', horizontal: 'hidden' }, // Show vertical and horizontal scrollbars
};

const COMPILER_OPTIONS: monaco.languages.typescript.CompilerOptions = {
    noEmit: true, // Don't generate output files when compiling
    allowJs: true, // Allow using JavaScript files
    strict: true, // Enable strict mode
    esModuleInterop: true, // Allow import/export between CommonJS and ES Modules
    allowNonTsExtensions: true, // Allow importing non-TypeScript files
    typeRoots: ['node_modules/@types'], // Directory containing type definitions
    target: monaco.languages.typescript.ScriptTarget.ES2020, // Target JavaScript version
    module: monaco.languages.typescript.ModuleKind.CommonJS, // Use CommonJS module system
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs, // Resolve modules like Node.js
    checkJs: true, // Check for errors in JavaScript files
    noImplicitAny: false, // Report errors when variables have no type
    noImplicitThis: false, // Report errors when 'this' has no type
    noImplicitReturns: true, // Report errors when function doesn't return in all code paths
    noFallthroughCasesInSwitch: true, // Report errors when switch case has no break
    noUnusedLocals: true, // Report errors when local variables are unused
    noUnusedParameters: true, // Report errors when parameters are unused
    noImplicitUseStrict: false, // Don't automatically add 'use strict'
    noUncheckedIndexedAccess: true, // Strict checking when accessing arrays/objects by index
    forceConsistentCasingInFileNames: true, // Enforce consistent casing in file names
};

const DIAGNOSTICS_OPTIONS: monaco.languages.typescript.DiagnosticsOptions = {
    noSyntaxValidation: false, // Enable syntax validation
    noSemanticValidation: false, // Enable semantic validation
    noSuggestionDiagnostics: false, // Enable error suggestions
    diagnosticCodesToIgnore: [], // List of error codes to ignore
};

export const CustomMonacoEditor = ({
    editedCode,
    onCodeChange,
    language = 'javascript',
}: CustomMonacoEditorProps) => {
    const monaco = useMonaco();

    useEffect(() => {
        if (!monaco) return;

        let provider: monaco.IDisposable;

        switch (language) {
            case 'javascript': {
                // Add global type definition for cheerio
                monaco.languages.typescript.javascriptDefaults.addExtraLib(cheerioTypes);

                // Set compiler options to allow global variables
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions(COMPILER_OPTIONS);

                // Configure TypeScript language features
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                    DIAGNOSTICS_OPTIONS,
                );

                provider = monaco.languages.registerCompletionItemProvider('javascript', {
                    triggerCharacters: ['ctrl+space', '.'],
                    provideCompletionItems: (
                        model: monaco.editor.ITextModel,
                        position: monaco.Position,
                    ) => {
                        const word = model.getWordUntilPosition(position);
                        const range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };

                        return {
                            suggestions: CHEERIO_COMPLETION_ITEMS.map((suggestion) => ({
                                ...suggestion,
                                range,
                            })),
                        };
                    },
                });

                break;
            }

            case 'html': {
                // Enable HTML language features
                monaco.languages.html.htmlDefaults.setOptions({
                    suggest: { html5: true },
                    format: {
                        tabSize: 2,
                        insertSpaces: true,
                        wrapLineLength: 0,
                        unformatted: '',
                        contentUnformatted: 'pre,code,textarea',
                        indentInnerHtml: false,
                        preserveNewLines: true,
                        maxPreserveNewLines: 2,
                        indentHandlebars: false,
                        endWithNewline: true,
                        extraLiners: 'head, body, /html',
                        wrapAttributes: 'auto',
                    },
                });

                monaco.languages.html.htmlDefaults.setModeConfiguration({
                    documentFormattingEdits: true,
                    documentRangeFormattingEdits: true,
                    completionItems: true,
                    hovers: true,
                    documentSymbols: true,
                    links: true,
                    colors: true,
                    foldingRanges: true,
                    diagnostics: true,
                    selectionRanges: true,
                    rename: false,
                });

                break;
            }
        }

        return () => {
            if (provider) {
                provider.dispose();
            }
        };
    }, [monaco, language]);

    const handleEditorChange = useMemo(
        () =>
            debounce((value?: string) => {
                onCodeChange?.(value ?? '');
            }, 500),
        [onCodeChange],
    );

    return (
        <Editor
            height="500px"
            loading={!monaco}
            value={editedCode}
            defaultLanguage={language}
            onChange={handleEditorChange}
            options={MONACO_EDITOR_OPTIONS}
        />
    );
};
