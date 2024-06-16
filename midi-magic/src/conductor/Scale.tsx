import {
  Flavour,
  NOTE_NAMES,
  NoteNumber,
  SCALE_TYPES,
  ScaleChords,
  ScaleType,
  createScale,
} from "../harmony/scales";
import { JSX } from "preact/jsx-runtime";
import { activeChord, activeScale } from "./state";
import "./Scale.css";

const CHORD_SUFFIXES: Record<Flavour, string> = {
  maj: "",
  min: "m",
  dim: "dim",
  aug: "aug",
};

export function Scale() {
  const onNoteChange = (evt: JSX.TargetedEvent<HTMLSelectElement>) =>
    (activeScale.value = createScale(
      activeScale.value.type,
      parseInt(evt.currentTarget.value) as NoteNumber,
    ));

  const onTypeChange = (evt: JSX.TargetedEvent<HTMLSelectElement>) =>
    (activeScale.value = createScale(
      evt.currentTarget.value as ScaleType,
      activeScale.value.root,
    ));

  const chordPositions = Object.keys(
    activeScale.value.chords,
  ) as (keyof ScaleChords)[];

  return (
    <div class="com-scales">
      <h4>
        Current scale{" "}
        <select onChange={onNoteChange}>
          {NOTE_NAMES.map((name, note) => (
            <option
              value={note}
              selected={activeScale.value.root == note}
              key={note}
            >
              {name}
            </option>
          ))}
        </select>
        <select onChange={onTypeChange}>
          {Object.keys(SCALE_TYPES).map((key) => {
            const scaleType = SCALE_TYPES[key as ScaleType];
            return (
              <option
                value={key}
                selected={activeScale.value.type == scaleType.type}
              >
                {scaleType.label}
              </option>
            );
          })}
        </select>
      </h4>

      <table>
        <thead>
          <tr>
            {chordPositions.map((key) => (
              <td class={key} />
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {chordPositions.map((key) => {
              const chord = activeScale.value.chords[key];
              return (
                <td class={activeChord.value == chord ? "active-chord" : ""}>
                  {key}
                </td>
              );
            })}
          </tr>
          <tr>
            {chordPositions.map((key) => {
              const chord = activeScale.value.chords[key];
              return (
                <td class={activeChord.value == chord ? "active-chord" : ""}>
                  {NOTE_NAMES[chord.notes[0]]}
                  {CHORD_SUFFIXES[chord.flavour]}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
