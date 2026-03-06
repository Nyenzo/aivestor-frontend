import React from 'react';
import { render, screen } from '@testing-library/react';
import AllocationDoughnut from '../../app/components/AllocationDoughnut';

// Mock Recharts ResponsiveContainer to just return children
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => (
            <div style={{ width: '800px', height: '600px' }}>{children}</div>
        ),
    };
});

describe('AllocationDoughnut Component', () => {
    it('renders "No allocation data" when positions array is empty', () => {
        render(<AllocationDoughnut positions={[]} />);
        expect(screen.getByText('No allocation data')).toBeInTheDocument();
    });

    it('renders correctly with mocked positions', () => {
        const positions = [
            { symbol: 'AAPL', quantity: 10, current_price: 150 },
            { symbol: 'GOOGL', quantity: 5, current_price: 2800 },
        ];
        render(<AllocationDoughnut positions={positions} />);

        // Total = 10*150 + 5*2800 = 1500 + 14000 = 15500
        // Rounded to thousands = 16k
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('$16k')).toBeInTheDocument();

        // Shows percentages and symbols
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
        expect(screen.getByText('10%')).toBeInTheDocument();
        expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('groups 3rd+ item into "Others"', () => {
        const positions = [
            { symbol: 'AAPL', quantity: 1, current_price: 100 }, // 100
            { symbol: 'GOOGL', quantity: 1, current_price: 200 }, // 200
            { symbol: 'MSFT', quantity: 1, current_price: 50 },  // 50
            { symbol: 'TSLA', quantity: 1, current_price: 10 },  // 10
        ]; // Total 360
        render(<AllocationDoughnut positions={positions} />);

        expect(screen.getByText('GOOGL')).toBeInTheDocument(); // Top
        expect(screen.getByText('AAPL')).toBeInTheDocument(); // 2nd
        expect(screen.getByText('Others')).toBeInTheDocument(); // 3rd and 4th grouped
        expect(screen.queryByText('MSFT')).not.toBeInTheDocument();
        expect(screen.queryByText('TSLA')).not.toBeInTheDocument();
    });
});
