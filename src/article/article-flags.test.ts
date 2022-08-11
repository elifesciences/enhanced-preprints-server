/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { generateFlags } from './article-flags';

describe('article flags', () => {
  it('returns only evidence and importance flags if msas are empty', () => {
    document.body.innerHTML = generateFlags([], 'important', 'strong');
    const flagCount = document.body.querySelector('ol')?.childElementCount;

    expect(flagCount).toStrictEqual(2);
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('strong')).toBeInTheDocument();
  });

  it('returns each msa in the list', () => {
    document.body.innerHTML = generateFlags(['msa1', 'msa2', 'msa3'], 'important', 'strong');

    expect(screen.getByText('msa1')).toBeInTheDocument();
    expect(screen.getByText('msa2')).toBeInTheDocument();
    expect(screen.getByText('msa3')).toBeInTheDocument();
  });
});
