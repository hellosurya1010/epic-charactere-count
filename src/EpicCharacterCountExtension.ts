import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorState } from '@tiptap/pm/state';


export const WordCountKey = new PluginKey('wordCount');


type Segments = "character" | "word" | "sentence";

type WordCountState = Record<Segments, number>;

type SegmenterFns = Record<Segments, (text: string) => number>

const segmenter: SegmenterFns = {
  character: (text) => {
    const grapheme = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...grapheme.segment(text)].length;
  },
  word: (text) => {
    const word = new Intl.Segmenter(undefined, { granularity: 'word' });
    return [...word.segment(text)].filter(segment => segment.isWordLike).length;
  },
  sentence: (text) => {
    const sentence = new Intl.Segmenter(undefined, { granularity: 'sentence' });
    return [...sentence.segment(text)].length;
  },
}



type EpicCharacterCountExtensionOptions = {
  enabled: boolean,
  includeCountOf: Record<Segments, boolean>,
}

const EpicCharacterCountExtension = Extension.create<EpicCharacterCountExtensionOptions>({
  name: 'EpicCharacterCount',
  addOptions() {
    return {
      enabled: true,
      includeCountOf: {
        character: false,
        sentence: false,
        word: false,
      },
    }
  },
  addProseMirrorPlugins() {

    const { includeCountOf, enabled } = this.options;

    const requiredSegments = Object.entries(includeCountOf).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = segmenter[key];
      }
      return acc;
    }, {} as SegmenterFns);


    const getWordCount = (state: EditorState): WordCountState => {
      let textContent = state.doc.textBetween(0, state.doc.content.size, ' ', ' ');
      return Object.entries(requiredSegments).reduce((acc, [seg, fn]) => {
        acc[seg] = fn(textContent);
        return acc;
      }, {} as WordCountState);
    }


    return [
      new Plugin({
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
      })
    ];
  },
})




export default EpicCharacterCountExtension