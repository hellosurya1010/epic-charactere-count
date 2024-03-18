export type Segments = "character" | "word" | "sentence";
export type SegmenterFns = Record<Segments, (text: string) => number>

export const segmenter: SegmenterFns = {
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