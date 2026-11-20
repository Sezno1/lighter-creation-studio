import type { Concept } from '../data';

export default function ConceptImage({ c }: { c: Concept }) {
  return <img src={c.img} alt={c.name.en} loading="lazy" draggable={false} />;
}
