import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import init, { convert } from '../../crates/parser/pkg/parser';

import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import 'prismjs/themes/prism-tomorrow.css';

const DEFAULT_MARKDOWN = `# Eon1-67 Update [ 06.07.2067 ]

## New Contents

### [ 67 Auras ]

\`- 30 TRANSCENDENT tier auras\`
\`- 37 GLORIOUS tier auras\`

## Dev Note

\`This week, we did 6-7.\`

\`In addition, we did 6-1 too.\`

\`Thank you\`
\`- 54_xyz -\``

export default function Converter() {
    const [markdownText, setMarkdownText] = createSignal(DEFAULT_MARKDOWN);
    const [luauText, setLuauText] = createSignal('');
    const [isReady, setIsReady] = createSignal(false);

    let editorContainer: HTMLDivElement | undefined;
    let editorView: EditorView | undefined;

    onMount(async () => {
        await init();
        setIsReady(true);

        if (editorContainer) {
            const state = EditorState.create({
                doc: markdownText(),
                extensions: [
                    // lineNumbers(),
                    highlightActiveLine(),
                    history(),
                    keymap.of([...defaultKeymap, ...historyKeymap]),
                    markdown(),
                    oneDark,
                    EditorView.lineWrapping,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            setMarkdownText(update.state.doc.toString());
                        }
                    }),
                    EditorView.theme({
                        '&': { height: '100%', 'font-size': '14px' },
                        '.cm-scroller': { 'font-family': 'monospace', 'scrollbar-width': 'none', },
                        '.cm-scroller::-webkit-scrollbar': { display: 'none' },
                    }),
                ],
            });

            editorView = new EditorView({
                state,
                parent: editorContainer,
            });
        }
    });

    onCleanup(() => {
        editorView?.destroy();
    });

    createEffect(() => {
        if (isReady()) {
            setLuauText(convert(markdownText()));
        }
    });

    const highlightedLuau = () => {
        if (!isReady()) return '';
        return Prism.highlight(luauText(), Prism.languages.lua, 'lua');
    };

    return (
        <div style={{ display: 'flex', gap: '1rem', height: '70vh' }}>
            <div style={{ flex: 1, 'min-width': 0, display: 'flex', 'flex-direction': 'column' }}>
                <h2>Markdown 입력</h2>
                <div
                    ref={ editorContainer }
                    style={{
                        flex: 1,
                        border: '1px solid #777',
                        'border-radius': '4px',
                        overflow: 'hidden',
                    }}
                />
            </div>

            <div style={{ flex:1, display: 'flex', 'min-width': 0, 'flex-direction': 'column' }}>
                <h2>Luau 출력</h2>
                <pre
                    style={{
                        flex: 1,
                        margin: 0,
                        padding: '0.5rem',
                        border: '1px solid #777',
                        'border-radius': '4px',
                        'background-color': '#2d2d2d',
                        color: '#ccc',
                        'font-family': 'monospace',
                        'font-size': '14px',
                        overflow: 'auto',
                        'scrollbar-width': 'none',
                        'white-space': 'pre-wrap',
                    }}
                >
                    {isReady()? (
                        <code class="language-lua" innerHTML={ highlightedLuau() }/>
                    ) : (
                        'Loading WASM...'
                    )}
                </pre>
            </div>
        </div>
    );
}