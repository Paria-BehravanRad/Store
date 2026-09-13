'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export type GlassSelectOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

type GlassSelectProps<T extends string = string> = {
  value: T;
  options: GlassSelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  align?: 'start' | 'end';
  fullWidth?: boolean;
  disabled?: boolean;
};

export function GlassSelect<T extends string = string>({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  placeholder = 'Select',
  className = '',
  triggerClassName = '',
  align = 'start',
  fullWidth = false,
  disabled = false,
}: GlassSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}
    >
      {label ? (
        <span className="mb-1.5 block text-xs font-medium text-ink-700">{label}</span>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? label ?? placeholder}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className={`glass-select-trigger ${fullWidth ? 'w-full' : ''} ${triggerClassName}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <Chevron open={open} />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={`glass-menu ${align === 'end' ? 'end-0' : 'start-0'} ${
            fullWidth ? 'w-full' : 'min-w-[12rem]'
          }`}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`glass-menu-item ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs text-ink-700/80">
                      {option.description}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 text-ink-700 transition duration-200 ${
        open ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type GlassMenuProps = {
  open: boolean;
  onClose: () => void;
  align?: 'start' | 'end';
  className?: string;
  children: ReactNode;
};

export function GlassMenu({
  open,
  onClose,
  align = 'end',
  className = '',
  children,
}: GlassMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className={`glass-menu ${align === 'end' ? 'end-0' : 'start-0'} ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
}
