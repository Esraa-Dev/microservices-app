import React from 'react';

export type InputProps =
  | ({
      label?: string;
      className?: string;
      type?: 'text' | 'number' | 'password' | 'email';
    } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({
      label?: string;
      className?: string;
      type: 'textarea';
    } & React.TextareaHTMLAttributes<HTMLTextAreaElement>);

const Input = ({
  label,
  type = 'text',
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          className={`w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 p-2.5 rounded-lg focus:outline-none focus:border-[#e37937] focus:ring-1 focus:ring-[#e37937]/20 transition-all text-sm ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          className={`w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 p-2.5 rounded-lg focus:outline-none focus:border-[#e37937] focus:ring-1 focus:ring-[#e37937]/20 transition-all text-sm ${className}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};

export default Input;
