/**
 * Skeleton Loading Components
 * 
 * Provides reusable skeleton screens for better loading UX.
 * Shows content placeholders while data is being fetched.
 */

// Base Skeleton component
export function Skeleton({ className = '', width = '100%', height = '20px', rounded = '4px' }) {
  return (
    <div
      className={`animate-pulse bg-gray-700 ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <Skeleton width="60%" height="24px" className="mb-4" />
      <Skeleton width="100%" height="16px" className="mb-2" />
      <Skeleton width="80%" height="16px" className="mb-2" />
      <Skeleton width="90%" height="16px" />
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-gray-700">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-4 px-4">
          <Skeleton width="80%" height="16px" />
        </td>
      ))}
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 5, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx} className="text-left pb-3 px-4">
                <Skeleton width="60%" height="16px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <TableRowSkeleton key={idx} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = '300px', className = '' }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <Skeleton width="40%" height="20px" className="mb-6" />
      <div className="relative" style={{ height }}>
        <Skeleton width="100%" height="100%" rounded="8px" />
      </div>
    </div>
  );
}

// Portfolio Holdings Skeleton
export function PortfolioHoldingsSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <Skeleton width="30%" height="24px" className="mb-4" />
      <TableSkeleton rows={5} columns={7} />
    </div>
  );
}

// Dashboard Summary Skeleton
export function DashboardSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-gray-800 p-6 rounded-lg">
          <Skeleton width="60%" height="16px" className="mb-4" />
          <Skeleton width="80%" height="32px" className="mb-2" />
          <Skeleton width="40%" height="14px" />
        </div>
      ))}
    </div>
  );
}

// Stock Item Skeleton
export function StockItemSkeleton() {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <Skeleton width="60px" height="20px" />
        <Skeleton width="80px" height="20px" />
      </div>
      <Skeleton width="100%" height="16px" className="mb-2" />
      <div className="flex justify-between">
        <Skeleton width="80px" height="16px" />
        <Skeleton width="60px" height="16px" />
      </div>
    </div>
  );
}

// Stock List Skeleton
export function StockListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <StockItemSkeleton key={idx} />
      ))}
    </div>
  );
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ isUser = false }) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <Skeleton width="40px" height="40px" rounded="50%" />
      <div className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block ${isUser ? 'ml-auto' : ''}`}>
          <Skeleton width="300px" height="80px" rounded="12px" />
        </div>
      </div>
    </div>
  );
}

// Chat History Skeleton
export function ChatHistorySkeleton() {
  return (
    <div className="p-6">
      <ChatMessageSkeleton isUser={false} />
      <ChatMessageSkeleton isUser={true} />
      <ChatMessageSkeleton isUser={false} />
      <ChatMessageSkeleton isUser={true} />
    </div>
  );
}

// Market Ticker Skeleton
export function MarketTickerSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 10 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg whitespace-nowrap">
          <Skeleton width="60px" height="16px" />
          <Skeleton width="80px" height="16px" />
          <Skeleton width="60px" height="16px" />
        </div>
      ))}
    </div>
  );
}

// Profile Form Skeleton
export function ProfileFormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx}>
          <Skeleton width="30%" height="16px" className="mb-2" />
          <Skeleton width="100%" height="44px" rounded="8px" />
        </div>
      ))}
      <Skeleton width="120px" height="44px" rounded="8px" className="mt-6" />
    </div>
  );
}

// News Card Skeleton
export function NewsCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <Skeleton width="100%" height="120px" rounded="8px" className="mb-3" />
      <Skeleton width="80%" height="20px" className="mb-2" />
      <Skeleton width="100%" height="16px" className="mb-2" />
      <Skeleton width="90%" height="16px" className="mb-3" />
      <div className="flex justify-between">
        <Skeleton width="100px" height="14px" />
        <Skeleton width="80px" height="14px" />
      </div>
    </div>
  );
}

// News List Skeleton
export function NewsListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <NewsCardSkeleton key={idx} />
      ))}
    </div>
  );
}

// Transaction Item Skeleton
export function TransactionItemSkeleton() {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" rounded="50%" />
        <div>
          <Skeleton width="60px" height="16px" className="mb-2" />
          <Skeleton width="120px" height="14px" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton width="80px" height="16px" className="mb-2" />
        <Skeleton width="100px" height="14px" />
      </div>
    </div>
  );
}

// Transaction List Skeleton
export function TransactionListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <TransactionItemSkeleton key={idx} />
      ))}
    </div>
  );
}

// Full Page Skeleton
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton width="300px" height="40px" className="mb-8" />
        <DashboardSummarySkeleton />
        <div className="mt-8">
          <ChartSkeleton />
        </div>
        <div className="mt-8">
          <TableSkeleton rows={8} columns={6} />
        </div>
      </div>
    </div>
  );
}

export default {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  ChartSkeleton,
  PortfolioHoldingsSkeleton,
  DashboardSummarySkeleton,
  StockItemSkeleton,
  StockListSkeleton,
  ChatMessageSkeleton,
  ChatHistorySkeleton,
  MarketTickerSkeleton,
  ProfileFormSkeleton,
  NewsCardSkeleton,
  NewsListSkeleton,
  TransactionItemSkeleton,
  TransactionListSkeleton,
  FullPageSkeleton
};
