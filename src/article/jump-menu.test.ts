import { screen } from '@testing-library/dom';
import { Heading } from '../model/model';
import { jumpToMenu } from './jump-menu';
import '@testing-library/jest-dom';

const emptyHeadings: Heading[] = [];

const articleFragmentWithHeadings: Heading[] = [
  { id: 's1', text: 'heading 1' },
  { id: 's2', text: 'heading 2' },
  { id: 's3', text: 'heading 3' },
];

describe('jump-menu', () => {
  it('returns empty string if no headings', () => {
    document.body.append(jumpToMenu(emptyHeadings));

    expect(document.body.innerHTML).toStrictEqual('');
  });

  it('returns a list of headings', () => {
    document.body.append(jumpToMenu(articleFragmentWithHeadings));

    expect(screen.getByText('heading 1', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('heading 2', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('heading 3', { exact: false })).toBeInTheDocument();
  });
});
