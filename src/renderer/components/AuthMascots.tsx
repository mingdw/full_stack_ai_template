import { useEffect, useRef, type CSSProperties } from 'react';

export interface AuthMascotMood {
  /** 主密码开始有内容且未进入窥视 → 主角色轻倾 */
  lean: boolean;
  /** 密码类字段有内容 → 全体窥视 + 眼左偏；关闭跟眼 */
  peeking: boolean;
  /** 空提交 → 惊讶嘴 + 集体轻倾 */
  surprised: boolean;
  /** 当前聚焦的密码输入框为隐藏状态 → 眼睛闭上且偏向左侧 */
  hidden: boolean;
}

interface AuthMascotsProps {
  mood: AuthMascotMood;
  /** Ref to the focused input element — eyes will look toward it */
  focusTargetRef?: React.RefObject<HTMLElement>;
}

/**
 * Overlapping crowd layout (reference: orange in front of purple, then black / yellow).
 * Positions are relative to a fixed stage; bottom-aligned.
 */
const CHARACTERS = [
  {
    id: 'purple',
    color: '#6829FF',
    width: 58,
    height: 140,
    mouth: '#111',
    blink: '3.8s',
    primary: true,
    roundTop: false,
    left: 48,
    z: 1,
  },
  {
    id: 'black',
    color: '#111111',
    width: 40,
    height: 98,
    mouth: '#fff',
    blink: '4.2s',
    primary: false,
    roundTop: false,
    left: 98,
    z: 2,
  },
  {
    id: 'yellow',
    color: '#FFD700',
    width: 46,
    height: 76,
    mouth: '#111',
    blink: '3.6s',
    primary: false,
    roundTop: true,
    left: 130,
    z: 3,
  },
  {
    id: 'orange',
    color: '#ff7b00',
    width: 76,
    height: 60,
    mouth: '#111',
    blink: '4.5s',
    primary: false,
    roundTop: true,
    left: 6,
    z: 4,
  },
] as const;

export function AuthMascots({ mood, focusTargetRef }: AuthMascotsProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pupilRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const eyeLidRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onMove = (event: MouseEvent) => {
      // When hidden or surprised, don't track mouse
      if (mood.hidden || mood.surprised) {
        return;
      }

      // If a focus target exists, look toward it instead of the mouse
      const target = focusTargetRef?.current;
      let targetX: number;
      let targetY: number;

      if (target && document.activeElement === target) {
        const rect = target.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      } else {
        targetX = event.clientX;
        targetY = event.clientY;
      }

      pupilRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const deltaX = targetX - eyeX;
        const deltaY = targetY - eyeY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(5, Math.hypot(deltaX, deltaY) / 8);
        el.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;
      });
    };

    // Also update on focus changes
    const onFocusChange = () => {
      if (mood.hidden || mood.surprised) return;
      const target = focusTargetRef?.current;
      if (!target || document.activeElement !== target) return;

      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      pupilRefs.current.forEach((el) => {
        if (!el) return;
        const elRect = el.getBoundingClientRect();
        const eyeX = elRect.left + elRect.width / 2;
        const eyeY = elRect.top + elRect.height / 2;
        const deltaX = targetX - eyeX;
        const deltaY = targetY - eyeY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(5, Math.hypot(deltaX, deltaY) / 8);
        el.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('focusin', onFocusChange);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('focusin', onFocusChange);
    };
  }, [mood.hidden, mood.surprised, focusTargetRef]);

  let pupilIndex = 0;
  let lidIndex = 0;

  return (
    <div
      ref={stageRef}
      className="relative z-[1] h-[160px] w-[210px]"
      aria-hidden
    >
      {CHARACTERS.map((ch) => {
        const leanPrimary = mood.lean && ch.primary && !mood.surprised;
        const leanAll = mood.surprised;
        const hidden = mood.hidden && !mood.surprised;

        const moodTransform = leanAll
          ? 'rotate(-8deg) translateX(-2px)'
          : leanPrimary
            ? 'rotate(8deg) translateX(-2px)'
            : 'rotate(0deg)';

        const bodyStyle: CSSProperties = {
          position: 'absolute',
          left: ch.left,
          bottom: 0,
          zIndex: ch.z,
          width: ch.width,
          height: ch.height,
          backgroundColor: ch.color,
          borderTopLeftRadius: ch.roundTop ? 999 : 4,
          borderTopRightRadius: ch.roundTop ? 999 : 4,
          transformOrigin: 'bottom center',
          transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: moodTransform,
        };

        return (
          <div key={ch.id} style={bodyStyle}>
            <div className="absolute left-1/2 top-[18%] flex w-[62%] -translate-x-1/2 justify-between">
              {[0, 1].map((eye) => {
                const idx = pupilIndex++;
                const lidIdx = lidIndex++;
                return (
                  <span
                    key={eye}
                    className="auth-mascot-eye relative inline-block h-[9px] w-[9px] overflow-hidden rounded-full bg-white"
                    style={{ animationDuration: hidden ? '0s' : ch.blink }}
                  >
                    {/* Pupil */}
                    <span
                      ref={(el) => {
                        pupilRefs.current[idx] = el;
                      }}
                      className="pointer-events-none absolute left-1/2 top-1/2 block h-[55%] w-[55%] rounded-full bg-black"
                      style={{
                        transform: hidden
                          ? 'translate(calc(-50% - 4px), -50%)'
                          : 'translate(-50%, -50%)',
                        transition: 'transform 0.2s ease',
                        opacity: hidden ? 0 : 1,
                      }}
                    />
                    {/* Eye lid (closed eye line) — visible when hidden */}
                    <span
                      ref={(el) => {
                        eyeLidRefs.current[lidIdx] = el;
                      }}
                      className="pointer-events-none absolute left-1/2 top-1/2 block w-[80%] rounded-full bg-black"
                      style={{
                        height: hidden ? 2 : 0,
                        transform: 'translate(-50%, -50%)',
                        transition: 'height 0.2s ease',
                        opacity: hidden ? 1 : 0,
                      }}
                    />
                  </span>
                );
              })}
            </div>
            <div
              className="absolute left-1/2 top-[42%] -translate-x-1/2 transition-all duration-200"
              style={{
                width: 7,
                height: mood.surprised ? 10 : 3,
                borderRadius: mood.surprised ? 999 : 2,
                backgroundColor: ch.mouth,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
