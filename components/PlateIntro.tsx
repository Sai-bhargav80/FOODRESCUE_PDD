'use client';

import React, { useState, useEffect } from 'react';

type Step = 'INIT' | 'WALK_IN' | 'WAVE' | 'WALK_TO_PLATE' | 'GRIP' | 'DRAG' | 'RELEASE' | 'CROSSFADE' | 'TADA' | 'FINISHED';

interface PlateIntroProps {
  children: React.ReactNode;
}

export default function PlateIntro({ children }: PlateIntroProps) {
  const [step, setStep] = useState<Step>('INIT');
  const [sparks, setSparks] = useState<boolean>(false);

  useEffect(() => {
    // Check if prefers-reduced-motion is active
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setStep('FINISHED');
      return;
    }

    // Sequence timing config (total duration ~8.5s)
    const timings = {
      INIT: 200,
      WALK_IN: 1700,
      WAVE: 900,
      WALK_TO_PLATE: 1200,
      GRIP: 500,
      DRAG: 1500,
      RELEASE: 1000,
      CROSSFADE: 800,
      TADA: 1000,
    };

    let active = true;

    const runSeq = async () => {
      if (!active) return;
      
      // Step 1: Walk in
      await delay(timings.INIT);
      if (!active) return;
      setStep('WALK_IN');

      // Step 2: Wave
      await delay(timings.WALK_IN);
      if (!active) return;
      setStep('WAVE');

      // Step 3: Walk to plate
      await delay(timings.WAVE);
      if (!active) return;
      setStep('WALK_TO_PLATE');

      // Step 4: Grip plate
      await delay(timings.WALK_TO_PLATE);
      if (!active) return;
      setStep('GRIP');

      // Step 5: Drag plate
      await delay(timings.GRIP);
      if (!active) return;
      setStep('DRAG');

      // Step 6: Release plate (triggers scaling and sparks)
      await delay(timings.DRAG);
      if (!active) return;
      setStep('RELEASE');
      setSparks(true);

      // Step 7: Crossfade to card
      await delay(timings.RELEASE);
      if (!active) return;
      setStep('CROSSFADE');

      // Step 8: Ta-da flourish
      await delay(timings.CROSSFADE);
      if (!active) return;
      setStep('TADA');

      // Step 9: Finished & breathing loop
      await delay(timings.TADA);
      if (!active) return;
      setStep('FINISHED');
    };

    runSeq();

    return () => {
      active = false;
    };
  }, []);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Determine positions & animations based on current step
  const isWalking = step === 'WALK_IN' || step === 'WALK_TO_PLATE' || step === 'DRAG';
  
  // Character left position percentage
  let charLeft = '-80px';
  if (step === 'WALK_IN') charLeft = '18%';
  if (step === 'WAVE') charLeft = '18%';
  if (step === 'WALK_TO_PLATE') charLeft = '68%';
  if (step === 'GRIP') charLeft = '68%';
  if (step === 'DRAG') charLeft = '18%';
  if (step === 'RELEASE') charLeft = '18%';
  if (step === 'CROSSFADE') charLeft = '18%';
  if (step === 'TADA') charLeft = '8%';
  if (step === 'FINISHED') charLeft = '8%';

  // Plate left position
  let plateLeft = '80%';
  if (step === 'DRAG') plateLeft = 'calc(50% - 40px)';
  if (step === 'RELEASE' || step === 'CROSSFADE' || step === 'TADA' || step === 'FINISHED') {
    plateLeft = 'calc(50% - 40px)';
  }

  // Animation transition durations
  let charTransition = 'left 0.2s linear';
  if (step === 'WALK_IN') charTransition = 'left 1.7s linear';
  if (step === 'WALK_TO_PLATE') charTransition = 'left 1.2s ease-in-out';
  if (step === 'DRAG') charTransition = 'left 1.5s ease-in-out';
  if (step === 'TADA') charTransition = 'left 0.8s ease-out';

  let plateTransition = 'left 0.2s linear';
  if (step === 'DRAG') plateTransition = 'left 1.5s ease-in-out';

  // Card transition visibility
  const showCard = step === 'CROSSFADE' || step === 'TADA' || step === 'FINISHED';

  return (
    <div className="w-full max-w-[460px] mx-auto relative flex flex-col items-center">
      {/* 🔮 Animation Stage (Always rendered above/around the card) */}
      {step !== 'FINISHED' && (
        <div className="w-full h-[220px] relative overflow-hidden bg-transparent z-20">
          {/* Subtle floor line */}
          <div className="absolute bottom-6 left-0 right-0 h-[1.5px] bg-dark-800/40" />

          {/* 🌿 Mascot character */}
          <div
            className="absolute bottom-6 w-14 h-16 origin-bottom z-30"
            style={{
              left: charLeft,
              transition: charTransition,
              animation: isWalking ? 'bob 0.35s infinite ease-in-out' : step === 'FINISHED' ? 'breathe 2s infinite ease-in-out' : 'none'
            }}
          >
            {/* Chef Toque (Hat) */}
            <div className="absolute -top-4 left-3 w-8 h-5 bg-white rounded-full z-10 shadow-sm flex items-center justify-center">
              <div className="absolute -top-1.5 left-1 w-4 h-4 bg-white rounded-full" />
              <div className="absolute -top-2 left-2.5 w-4 h-4 bg-white rounded-full" />
              <div className="absolute -top-1.5 left-4 w-4 h-4 bg-white rounded-full" />
            </div>

            {/* Mascot Body (Vibrant Green) */}
            <div className="w-14 h-14 bg-gradient-to-b from-[#00e87e] to-[#00964f] rounded-[20px] border border-primary-400/20 relative shadow-[0_0_15px_rgba(0,232,126,0.3)]">
              {/* Eyes */}
              <div className="absolute top-4 left-3 w-2 h-2 bg-dark-950 rounded-full" />
              <div className="absolute top-4 left-9 w-2 h-2 bg-dark-950 rounded-full" />
              
              {/* Smile */}
              <div className="absolute top-6 left-5.5 w-3.5 h-2 border-b-[2px] border-dark-950 rounded-b-full" />

              {/* Chef Apron */}
              <div className="absolute bottom-0 left-3 w-8 h-6 bg-white rounded-t-sm rounded-b-md border-x border-t border-gray-100 flex items-center justify-center">
                <span className="text-[8px] leading-none select-none">🌿</span>
              </div>
            </div>

            {/* Left Arm */}
            <div
              className="absolute top-6 -left-3 w-4 h-2.5 bg-[#00e87e] rounded-full origin-right"
              style={{
                animation: step === 'WAVE' ? 'wave 0.3s infinite ease-in-out' : step === 'TADA' ? 'tada-arm-left 0.4s forwards ease-out' : 'none'
              }}
            />

            {/* Right Arm */}
            <div
              className="absolute top-6 -right-3 w-4 h-2.5 bg-[#00e87e] rounded-full origin-left"
              style={{
                transform: step === 'GRIP' || step === 'DRAG' ? 'rotate(-40deg)' : 'none',
                animation: step === 'TADA' ? 'tada-arm-right 0.4s forwards ease-out' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />

            {/* Legs */}
            <div
              className="absolute -bottom-3 left-3 w-2.5 h-4 bg-[#00753f] rounded-full origin-top"
              style={{ animation: isWalking ? 'walk-left 0.35s infinite linear' : 'none' }}
            />
            <div
              className="absolute -bottom-3 left-8.5 w-2.5 h-4 bg-[#00753f] rounded-full origin-top"
              style={{ animation: isWalking ? 'walk-right 0.35s infinite linear' : 'none' }}
            />
          </div>

          {/* 🍽️ Plate Prop */}
          {step !== 'CROSSFADE' && step !== 'TADA' && (
            <div
              className="absolute bottom-6 w-20 h-5 origin-center z-25"
              style={{
                left: plateLeft,
                transition: plateTransition,
                animation: step === 'RELEASE' ? 'plate-rock-scale 1.0s ease-out forwards' : 'none',
                transform: step === 'GRIP' || step === 'DRAG' ? 'rotate(-6deg)' : 'none'
              }}
            >
              {/* Ellipse plate body */}
              <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-300 rounded-full border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center p-1">
                {/* Plate inner well */}
                <div className="w-[85%] h-[80%] bg-gradient-to-b from-white to-gray-100 rounded-full border border-gray-200/50" />
              </div>
            </div>
          )}

          {/* Spark Particles during step 6 release */}
          {sparks && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-10 flex justify-around pointer-events-none z-30">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-ping opacity-75" />
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-ping opacity-90 delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-300 animate-ping opacity-80 delay-300" />
            </div>
          )}
        </div>
      )}

      {/* 🔘 Main Login/Signup Card Wrapper */}
      <div className="w-full relative z-10">
        {/* Glow Ring behind the card (permanent once animation reaches step 6/7) */}
        {(step === 'RELEASE' || step === 'CROSSFADE' || step === 'TADA' || step === 'FINISHED') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-primary-500/10 bg-gradient-to-br from-primary-500/5 to-transparent rounded-[36px] blur-md pointer-events-none z-0 animate-fade-in" />
        )}

        {/* Card Component (Crossfades & Scales In) */}
        <div
          style={{
            opacity: showCard ? 1 : 0,
            transform: showCard ? 'scale(1)' : 'scale(0.95)',
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: showCard ? 'auto' : 'none',
          }}
        >
          {children}
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes walk-left {
          0%, 100% { transform: rotate(-28deg); }
          50% { transform: rotate(28deg); }
        }
        @keyframes walk-right {
          0%, 100% { transform: rotate(28deg); }
          50% { transform: rotate(-28deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(45deg); }
        }
        @keyframes tada-arm-left {
          to { transform: rotate(-55deg); }
        }
        @keyframes tada-arm-right {
          to { transform: rotate(55deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(0.95) scaleX(1.02); }
        }
        @keyframes plate-rock-scale {
          0% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-8deg) scale(1.1); }
          40% { transform: rotate(6deg) scale(1.25); }
          60% { transform: rotate(-4deg) scale(1.4); }
          80% { transform: rotate(2deg) scale(1.55); }
          100% { transform: rotate(0deg) scale(1.85); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
