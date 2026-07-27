'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

interface PinInputProps {
  length?: number;
  title: string;
  subtitle: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
  onComplete: (pin: string) => void;
  onResend?: () => void;
  onBack?: () => void;
}

export default function PinInput({
  length = 6,
  title,
  subtitle,
  isLoading = false,
  error = '',
  success = '',
  onComplete,
  onResend,
  onBack,
}: PinInputProps) {
  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newPin = [...pin];
    // Keep only the last character entered
    const val = value.substring(value.length - 1);
    newPin[index] = val;
    setPin(newPin);

    // Auto-advance if we entered a character
    if (val !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setActiveIndex(index + 1);
    }

    // Check if code is complete
    const combined = newPin.join('');
    if (combined.length === length) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newPin = [...pin];
      if (newPin[index] !== '') {
        // Clear current box
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        // Clear previous box and focus it
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs.current[index - 1].focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const pastedDigits = pastedData.slice(0, length).split('');
    const newPin = [...pin];

    for (let i = 0; i < length; i++) {
      if (pastedDigits[i]) {
        newPin[i] = pastedDigits[i];
      }
    }

    setPin(newPin);

    // Focus the appropriate input after paste
    const nextFocusIndex = Math.min(pastedDigits.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
    setActiveIndex(nextFocusIndex);

    const combined = newPin.join('');
    if (combined.length === length) {
      onComplete(combined);
    }
  };

  const clearPin = () => {
    setPin(Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className={`flex flex-col items-center text-center ${title ? 'space-y-6' : 'space-y-2'}`}>
        {/* Animated Badge Icon */}
        {title && (
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-600 shadow-[0_0_25px_rgba(249,115,22,0.3)] flex items-center justify-center mb-1">
              <KeyRound className="w-7 h-7 text-white animate-pulse" />
            </div>
            {success && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-dark-950 flex items-center justify-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </div>
        )}

        {/* Text Header */}
        {title && (
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-xs md:text-sm text-dark-400 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
          </div>
        )}

        {/* PIN Inputs Container */}
        <div className="relative py-2">
          <div className="flex gap-2.5 justify-center">
            {pin.map((digit, index) => {
              const isActive = activeIndex === index;
              const isFilled = digit !== '';

              return (
                <div key={index} className="relative">
                  <input
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onFocus={() => setActiveIndex(index)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={isLoading || !!success}
                    className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-extrabold font-mono bg-dark-800/40 border-2 rounded-2xl text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                      success
                        ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                        : isActive
                        ? 'border-orange-500 bg-dark-700/60 shadow-[0_0_15px_rgba(249,115,22,0.45)]'
                        : isFilled
                        ? 'border-white/20 bg-dark-800/80'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                  {/* Subtle active underline or cursor blink */}
                  {isActive && !isLoading && !success && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute bottom-1 left-3 right-3 h-0.5 bg-orange-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading / Error States */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-xs font-semibold text-orange-400 font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                AUTO-VERIFYING PIN...
              </motion.div>
            )}
            {error && !isLoading && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-xs font-semibold font-mono"
              >
                ⚠ {error}
              </motion.p>
            )}
            {success && !isLoading && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-green-400 text-xs font-semibold font-mono"
              >
                ✓ {success}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Resend / Action Row */}
        {!success && (
          <div className="flex flex-col gap-3.5 w-full pt-2">
            {onResend && (
              <p className="text-xs text-dark-400">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isLoading}
                  className="text-orange-400 hover:text-orange-300 font-extrabold transition cursor-pointer disabled:opacity-50"
                >
                  Resend Pin
                </button>
              </p>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="text-xs text-dark-500 hover:text-dark-300 transition font-medium flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
              >
                ← Change email address
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
