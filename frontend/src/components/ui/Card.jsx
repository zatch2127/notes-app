import { clsx } from 'clsx';

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = true,
  ...props 
}) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        padding && 'p-6',
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
