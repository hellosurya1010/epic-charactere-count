import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorState } from '@tiptap/pm/state';
export const WordCountKey = new PluginKey('wordCount');


export interface WordCountState {
  characters: number;
  words: number;
  sentences: number;
}

export function WordCount() {
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
   */
  const grapheme = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const word = new Intl.Segmenter(undefined, { granularity: 'word' });
  const sentence = new Intl.Segmenter(undefined, { granularity: 'sentence' });

  const segment = (text: string): WordCountState => ({
    characters: [...grapheme.segment(text)].length,
    words: [...word.segment(text)].filter(segment => segment.isWordLike).length,
    sentences: [...sentence.segment(text)].length,
  });


  const getWordCount = (state: EditorState) => {
    let textContent = state.doc.textBetween(0, state.doc.content.size, ' ', ' ');
    return segment(textContent);
  }

  return new Plugin({
    key: WordCountKey,
    state: {
      init(config, state) {
        return getWordCount(state);
      },
      apply(tr, pluginState, prevState, state) {
        if (!tr.docChanged) return pluginState;
        return getWordCount(state);
      },
    },
  });
}

const EpicCharacterCountExtension = Extension.create({
  name: 'EpicCharacterCount',
  addProseMirrorPlugins() {
    return [WordCount()]
  },
})




export default EpicCharacterCountExtension