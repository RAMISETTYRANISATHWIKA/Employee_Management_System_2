import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-white/10 p-4">
        <Inbox className="h-8 w-8 text-white/50" />
      </div>
      <h3 className="text-lg font-medium text-white/80">{title}</h3>
      {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
    </div>
  );
}
