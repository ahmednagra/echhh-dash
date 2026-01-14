// src/components/ui/SuccessMessage.tsx
import { CheckCircle } from 'react-feather';

interface SuccessMessageProps {
  title: string;
  message: string;
}

export default function SuccessMessage({ title, message }: SuccessMessageProps) {
  return (
    <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
      <div className="flex items-center mb-2">
        <CheckCircle className="h-5 w-5 mr-2" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}