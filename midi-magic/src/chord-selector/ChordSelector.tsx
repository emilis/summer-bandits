import clsx from "clsx";
import { useState } from "preact/hooks";

import { activeScale } from "../conductor/state";
import type { Chord, NoteNumber, ScaleType } from "../harmony/scales";

import { ChordInput } from "./ChordInput";
import { ScaleSelector } from "./ScaleSelector";
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
          aria-controls="tabpanel-scale"
          children="Scale"
          className={clsx(tab === "scale" && "is-active")}
          id="tab-scale"
          onClick={() => setTab("scale")}
          role="tab"
        />
        <button
          aria-controls="tabpanel-chords"
          children="Chords"
          className={clsx(tab === "chords" && "is-active")}
          id="tab-chords"
          onClick={() => setTab("chords")}
          role="tab"
        />
        <button
          aria-controls="tabpanel-song"
          children="Song"
          className={clsx(tab === "song" && "is-active")}
          disabled
          id="tab-song"
          onClick={() => setTab("song")}
          role="tab"
        />
      </div>
      <div
        aria-labelledby="tab-scale"
        className={clsx(tab === "scale" && "is-active")}
        id="tabpanel-scale"
        role="tabpanel"
      >
        <ScaleSelector onChange={onSelectScale} scale={activeScale.value} />
      </div>
      <div
        aria-labelledby="tab-chords"
        className={clsx(tab === "chords" && "is-active")}
        id="tabpanel-chords"
        role="tabpanel"
      >
        <ChordInput onChange={onSelectChords} />
      </div>
      <div
        aria-labelledby="tab-song"
        className={clsx(tab === "song" && "is-active")}
        id="tabpanel-song"
        role="tabpanel"
      >
        <p className="error">Not implemented yet</p>
      </div>
    </section>
  );
}
