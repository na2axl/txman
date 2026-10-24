/**
 * Escapes wildcards from user input.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&');
}
