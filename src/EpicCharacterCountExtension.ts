import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorState } from '@tiptap/pm/state';
import { SegmenterFns, Segments, segmenter } from './segmenter';
import { debounce } from './debounce';

// declare module '@tiptap/core' {
//   interface Commands<ReturnType> {
//     epicCharacterCount: {
//       /**
//        * Moves the cursor to the start of current text block.
//        */
//       epicCharacterCountToggle: (enabled?: boolean) => ReturnType;
//     };
//   }
// }


export type WordCountState = Record<Segments, number>;

type EpicCharacterCountExtensionOptions = {
  enabled: boolean,
  includeCountOf: Record<Segments, boolean>,
  delay: number
}

export const WordCountKey = new PluginKey('wordCount');

export const EpicCharacterCountExtension = Extension.create<EpicCharacterCountExtensionOptions>({
  name: 'EpicCharacterCount',

  addOptions() {
    return {
      enabled: true,
      includeCountOf: {
        character: false,
        sentence: false,
        word: false,
      },
      delay: 500,
    }
  },



  // addCommands() {
  //   return {
  //     epicCharacterCountToggle: (enabled) => ({ editor }) => {
  //       this.options.enabled = typeof enabled != 'undefined' ? enabled : !this.options.enabled;
  //       return true;
  //     },

  //   }
  // },

  addProseMirrorPlugins() {

    const { includeCountOf, enabled, delay } = this.options;

    console.log(`plugin adding`);


    const requiredSegments = Object.entries(includeCountOf).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = segmenter[key];
      }
      console.log(`segment filtering`);
      return acc;
    }, {} as SegmenterFns);


    let startTime = new Date().getTime();
    let endTime = new Date().getTime();

    const isFrequent = () => {
      const timeDiff = Math.abs(startTime - endTime)
      console.log({ timeDiff, delay }, timeDiff < delay);
      return timeDiff < delay;
    };

    const getWordCount = (state: EditorState): WordCountState => {
      let textContent = state.doc.textBetween(0, state.doc.content.size, ' ', ' ');
      console.log(`Word counting is frequent`, isFrequent());
      let data = Object.entries(requiredSegments).reduce((acc, [seg, fn]) => {
        acc[seg] = fn(textContent);
        return acc;
      }, {} as WordCountState);
      endTime = new Date().getTime();
      return data;
    }

    return [
      new Plugin({
        key: WordCountKey,
        state: {
          init(config, state) {
            return getWordCount(state);
          },
          apply(tr, pluginState, prevState, state) {
            startTime = new Date().getTime();
            if (!enabled || !tr.docChanged || isFrequent()) return pluginState;
            return getWordCount(state);
          },
        },
      }),
    ];


  },
})
