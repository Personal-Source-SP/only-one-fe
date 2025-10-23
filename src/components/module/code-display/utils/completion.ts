import * as monaco from 'monaco-editor';

const createCompletionItem = (
    label: string,
    kind: monaco.languages.CompletionItemKind,
    insertText: string,
    documentation: string,
    insertTextRules?: monaco.languages.CompletionItemInsertTextRule,
): Omit<monaco.languages.CompletionItem, 'range'> => ({
    label,
    kind,
    insertText,
    insertTextRules,
    documentation: {
        value: documentation,
    },
});

export const CHEERIO_COMPLETION_ITEMS = [
    // Core methods
    createCompletionItem(
        'load',
        monaco.languages.CompletionItemKind.Function,
        'load(${1:html}, ${2:options})',
        'Load HTML string and return a Cheerio instance.\n\n@param html - HTML string or Buffer to load\n@param options - Parser options (xmlMode, decodeEntities, etc.)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'find',
        monaco.languages.CompletionItemKind.Method,
        "find('.${1:selector}')",
        'Find elements matching the selector.\n\n@param selector - CSS selector string or Cheerio object',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'text',
        monaco.languages.CompletionItemKind.Method,
        "text('${1:text}')",
        'Get or set the text content of the selected elements.\n\n@param text - Text content to set (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'html',
        monaco.languages.CompletionItemKind.Method,
        "html('${1:html}')",
        'Get or set the HTML contents of the first element.\n\n@param html - HTML string to set (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),

    // Attribute methods
    createCompletionItem(
        'attr',
        monaco.languages.CompletionItemKind.Method,
        "attr('${1:name}')",
        'Get or set an attribute value.\n\n@param name - Attribute name',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'removeAttr',
        monaco.languages.CompletionItemKind.Method,
        "removeAttr('${1:name}')",
        'Remove an attribute from each element.\n\n@param name - Name of the attribute to remove',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'prop',
        monaco.languages.CompletionItemKind.Method,
        "prop('${1:name}', '${2:value}')",
        'Get or set a property value.\n\n@param name - Property name\n@param value - Property value (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),

    // Class methods
    createCompletionItem(
        'addClass',
        monaco.languages.CompletionItemKind.Method,
        "addClass('.${1:className}')",
        'Add the specified class(es) to each element.\n\n@param className - Class name(s) to add',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'removeClass',
        monaco.languages.CompletionItemKind.Method,
        "removeClass('.${1:className}')",
        'Remove the specified class(es) from each element.\n\n@param className - Class name(s) to remove (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'hasClass',
        monaco.languages.CompletionItemKind.Method,
        "hasClass('.${1:className}')",
        'Check if any element has the specified class.\n\n@param className - Class name to check for',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'toggleClass',
        monaco.languages.CompletionItemKind.Method,
        "toggleClass('.${1:className}', '${2:toggleSwitch}')",
        'Add or remove class(es) from each element.\n\n@param className - Class name(s) to toggle\n@param toggleSwitch - Boolean to force add/remove (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),

    // DOM Traversal
    createCompletionItem(
        'parent',
        monaco.languages.CompletionItemKind.Method,
        "parent('.${1:selector}')",
        'Get the parent of each element.\n\n@param selector - Optional CSS selector to filter parent',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'parents',
        monaco.languages.CompletionItemKind.Method,
        "parents('.${1:selector}')",
        'Get all ancestors of each element.\n\n@param selector - Optional CSS selector to filter ancestors',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'parentsUntil',
        monaco.languages.CompletionItemKind.Method,
        "parentsUntil('.${1:selector}', '.${2:filter}')",
        'Get all ancestors until the selector.\n\n@param selector - Selector, element, or Cheerio object\n@param filter - Optional CSS selector to filter ancestors',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'closest',
        monaco.languages.CompletionItemKind.Method,
        "closest('.${1:selector}')",
        'Get the first element that matches the selector by testing the element itself and traversing up.\n\n@param selector - CSS selector to match',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'next',
        monaco.languages.CompletionItemKind.Method,
        "next('.${1:selector}')",
        'Get the immediately following sibling of each element.\n\n@param selector - Optional CSS selector to filter next siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'nextAll',
        monaco.languages.CompletionItemKind.Method,
        "nextAll('.${1:selector}')",
        'Get all following siblings of each element.\n\n@param selector - Optional CSS selector to filter siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'nextUntil',
        monaco.languages.CompletionItemKind.Method,
        "nextUntil('.${1:selector}', '.${2:filter}')",
        'Get all following siblings until the selector.\n\n@param selector - Selector, element, or Cheerio object\n@param filter - Optional CSS selector to filter siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'prev',
        monaco.languages.CompletionItemKind.Method,
        "prev('.${1:selector}')",
        'Get the immediately preceding sibling of each element.\n\n@param selector - Optional CSS selector to filter previous siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'prevAll',
        monaco.languages.CompletionItemKind.Method,
        "prevAll('.${1:selector}')",
        'Get all preceding siblings of each element.\n\n@param selector - Optional CSS selector to filter siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'prevUntil',
        monaco.languages.CompletionItemKind.Method,
        "prevUntil('.${1:selector}', '.${2:filter}')",
        'Get all preceding siblings until the selector.\n\n@param selector - Selector, element, or Cheerio object\n@param filter - Optional CSS selector to filter siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'siblings',
        monaco.languages.CompletionItemKind.Method,
        "siblings('.${1:selector}')",
        'Get all siblings of each element.\n\n@param selector - Optional CSS selector to filter siblings',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'contents',
        monaco.languages.CompletionItemKind.Method,
        'contents()',
        'Get the children of each element, including text and comment nodes.',
    ),

    // DOM Manipulation
    createCompletionItem(
        'append',
        monaco.languages.CompletionItemKind.Method,
        "append('${1:content}')",
        'Insert content at the end of each element.\n\n@param content - Content to append (string, element, or Cheerio object)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'prepend',
        monaco.languages.CompletionItemKind.Method,
        "prepend('${1:content}')",
        'Insert content at the beginning of each element.\n\n@param content - Content to prepend (string, element, or Cheerio object)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'after',
        monaco.languages.CompletionItemKind.Method,
        "after('${1:content}')",
        'Insert content immediately after each element.\n\n@param content - Content to insert (string, element, or Cheerio object)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'before',
        monaco.languages.CompletionItemKind.Method,
        "before('${1:content}')",
        'Insert content immediately before each element.\n\n@param content - Content to insert (string, element, or Cheerio object)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'remove',
        monaco.languages.CompletionItemKind.Method,
        "remove('.${1:selector}')",
        'Remove elements from the DOM.\n\n@param selector - Optional CSS selector to filter elements to remove',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'empty',
        monaco.languages.CompletionItemKind.Method,
        'empty()',
        'Remove all child nodes of each element.',
    ),
    createCompletionItem(
        'replaceWith',
        monaco.languages.CompletionItemKind.Method,
        "replaceWith('${1:content}')",
        'Replace each element with the specified content.\n\n@param content - Content to replace with (string, element, or Cheerio object)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'wrap',
        monaco.languages.CompletionItemKind.Method,
        "wrap('${1:content}')",
        'Wrap each element with the specified content.\n\n@param content - Content to wrap with (string, element, or Cheerio object)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),

    // CSS
    createCompletionItem(
        'css',
        monaco.languages.CompletionItemKind.Method,
        "css('${1:propertyName}', '${2:value}')",
        'Get or set CSS properties.\n\n@param propertyName - CSS property name or object of properties\n@param value - CSS property value (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),

    // Collection methods
    createCompletionItem(
        'each',
        monaco.languages.CompletionItemKind.Method,
        'each((${1:index}, ${2:element}) => {\n\t$0\n})',
        'Iterate over each element in the set.\n\n@param callback - Function to execute for each element',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'map',
        monaco.languages.CompletionItemKind.Method,
        'map((${1:index}, ${2:element}) => {\n\treturn $0\n})',
        'Map each element to a new value.\n\n@param callback - Function to execute for each element',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'filter',
        monaco.languages.CompletionItemKind.Method,
        "filter('.${1:selector}')",
        'Filter the set of elements.\n\n@param selector - CSS selector, element, or filter function',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'not',
        monaco.languages.CompletionItemKind.Method,
        "not('.${1:selector}')",
        'Remove elements from the set.\n\n@param selector - CSS selector, element, or filter function',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'first',
        monaco.languages.CompletionItemKind.Method,
        'first()',
        'Get the first element in the set.',
    ),
    createCompletionItem(
        'last',
        monaco.languages.CompletionItemKind.Method,
        'last()',
        'Get the last element in the set.',
    ),
    createCompletionItem(
        'eq',
        monaco.languages.CompletionItemKind.Method,
        'eq(${1:index})',
        'Get the element at the specified index.\n\n@param index - Zero-based index of the element to get',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'get',
        monaco.languages.CompletionItemKind.Method,
        'get(${1:index})',
        'Get the element at the specified index.\n\n@param index - Zero-based index of the element to get (optional)',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'index',
        monaco.languages.CompletionItemKind.Method,
        "index('.${1:selector}')",
        'Get the index of an element.\n\n@param selector - Optional selector to find the index of',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'end',
        monaco.languages.CompletionItemKind.Method,
        'end()',
        'End the most recent filtering operation and return the set of matched elements to its previous state.',
    ),
    createCompletionItem(
        'add',
        monaco.languages.CompletionItemKind.Method,
        "add('${1:selectorOrHtml}', ${2:context})",
        'Add elements to the set of matched elements.\n\n@param selectorOrHtml - Selector, HTML string, or element\n@param context - Optional context to search in',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),
    createCompletionItem(
        'addBack',
        monaco.languages.CompletionItemKind.Method,
        'addBack(${1:filter})',
        'Add the previous set of elements to the current set.\n\n@param filter - Optional selector to filter the previous set',
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    ),

    // Utility methods
    createCompletionItem(
        'clone',
        monaco.languages.CompletionItemKind.Method,
        'clone()',
        'Create a deep copy of the set of matched elements.',
    ),
    createCompletionItem(
        'toArray',
        monaco.languages.CompletionItemKind.Method,
        'toArray()',
        'Convert the set of matched elements to an array.',
    ),
    createCompletionItem(
        'serialize',
        monaco.languages.CompletionItemKind.Method,
        'serialize()',
        'Convert the set of matched elements to a string.',
    ),
    createCompletionItem(
        'serializeArray',
        monaco.languages.CompletionItemKind.Method,
        'serializeArray()',
        'Convert the set of matched elements to an array of objects.',
    ),
];
