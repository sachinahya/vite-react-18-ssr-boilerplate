import { render, screen } from '@testing-library/react';

import { Figure } from './figure.js';

describe('Figure', () => {
  it('renders text', () => {
    render(<Figure />);

    expect(screen.getByText('Figure')).toBeInTheDocument();
  });
});
