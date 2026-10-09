import { useId } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";

/**
 * The one labelled range input on the site. The label stays fixed and the
 * value is shown next to it and announced through aria-valuetext, so the
 * control's accessible name does not change as it moves.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: L;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const { t } = useLang();
  const id = useId();
  const shown = format(value);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <label htmlFor={id} className="font-semibold">
          {t(label)}
        </label>
        <output htmlFor={id} className="num font-bold">
          {shown}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
