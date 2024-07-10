import clsx from "clsx";
import { useState } from "preact/hooks";

import { activeScale } from "../conductor/state";
import type { Chord, NoteNumber, ScaleType } from "../harmony/scales";

import { ChordInput } from './ChordInput';
import { ScaleSelector } from './ScaleSelector';
import "./ChordSelector.css";

type Props = {
  onSelectChords: (chords: Chord[]) => void;
  onSelectScale: (rootNote: NoteNumber, scaleType: ScaleType) => void;
};

type Tab = "scale" | "chords" | "song";

export function ChordSelector({ onSelectScale, onSelectChords }: Props) {
  const [tab, setTab] = useState<Tab>("scale");
  return (
    <section className="com-chord-selector">
      <div role="tablist">
        <button
          children="Scale"
          className={clsx(tab ==="scale" && "is-active")}
          id="tab-scale"
          onClick={() => setTab("scale")}
          role="tab"
        />
        <button
          children="Chords"
          className={clsx(tab ==="chords" && "is-active")}
          id="tab-chords"
          onClick={() => setTab("chords")}
          role="tab"
        />
        <button
          children="Song"
          className={clsx(tab ==="song" && "is-active")}
          disabled
          id="tab-song"
          onClick={() => setTab("song")}
          role="tab"
        />
      </div>
      { tab === "scale"
        ? <div aria-labelledby="tab-scale" role="tabpanel">
            <ScaleSelector
              onChange={onSelectScale}
              scale={activeScale.value}
            />
          </div>
        : tab === "chords"
        ? <div aria-labelledby="tab-chords" role="tabpanel">
            <ChordInput onChange={onSelectChords} />
          </div>
        : <div aria-labelledby="tab-song" role="tabpanel">
            <p className="error">Not implemented yet</p>
          </div>
      }
    </section>
  );
};
