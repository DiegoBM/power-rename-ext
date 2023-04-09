import { Extension } from '@codemirror/state';

import {
  CompletionContext,
  CompletionSource,
  autocompletion,
  Completion,
  CompletionResult,
} from '@codemirror/autocomplete';

export function autocomplete(completions: Completion[] = []): Extension {
  return autocompletion({
    override: [
      (context: CompletionContext) => {
        let word = context.matchBefore(/this.([\w\.]+)?/);

        // If not found, fallback to the language completion
        if (!word) {
          const matches = context.state.languageDataAt(
            'autocomplete',
            context.pos
          ) as CompletionSource[];

          if (!matches.length) return null;

          let options = matches.reduce<Completion[]>(
            (acc, curr) =>
              acc.concat((curr(context) as CompletionResult)?.options ?? []),
            []
          );
          return { ...matches[0](context), options } as CompletionResult;
        }

        if (word && word.from == word.to && !context.explicit) {
          return null;
        }

        return {
          from: word?.from + 'this.'.length!,
          options: completions,
        };
      },
    ],
  });
}

// export const autocompleteView: Extension = [autocomplete()];
