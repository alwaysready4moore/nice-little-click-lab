export const ROOM = { width: 1200, height: 800 };
export const LIMITS = { furniture: 48, people: 240, name: 80 };
export type FurnitureKind = "round" | "rectangle" | "desk" | "label";
export type Furniture = { id: string; kind: FurnitureKind; label: string; x: number; y: number; capacity: number };
export type Person = { id: string; name: string; furnitureId: string | null; seat: number | null };
export type SeatingProject = { version: 1; title: string; furniture: Furniture[]; people: Person[] };
export type Template = "wedding" | "classroom" | "blank";

export function dimensions(kind: FurnitureKind) {
  return kind === "round" ? { width: 250, height: 230 } : kind === "rectangle" ? { width: 380, height: 200 } : kind === "desk" ? { width: 180, height: 140 } : { width: 190, height: 60 };
}
export function clampPosition(kind: FurnitureKind, x: number, y: number) {
  const d = dimensions(kind);
  return { x: Math.max(d.width / 2, Math.min(ROOM.width - d.width / 2, x)), y: Math.max(d.height / 2, Math.min(ROOM.height - d.height / 2, y)) };
}
export function createProject(template: Template): SeatingProject {
  const furniture: Furniture[] = [];
  if (template === "wedding") {
    for (let i = 0; i < 6; i++) furniture.push({ id: `table-${i}`, kind: "round", label: `Table ${i + 1}`, x: 210 + (i % 3) * 390, y: 235 + Math.floor(i / 3) * 340, capacity: 8 });
  } else if (template === "classroom") {
    furniture.push({ id: "front", kind: "label", label: "Front of room", x: 600, y: 45, capacity: 0 });
    for (let i = 0; i < 20; i++) furniture.push({ id: `desk-${i}`, kind: "desk", label: `Desk ${i + 1}`, x: 160 + (i % 5) * 220, y: 180 + Math.floor(i / 5) * 175, capacity: 1 });
  }
  return { version: 1, title: template === "classroom" ? "Our classroom" : "Everyone has a place", furniture, people: [] };
}
export function assignPerson(project: SeatingProject, personId: string, furnitureId: string, seat: number): SeatingProject {
  const table = project.furniture.find(f => f.id === furnitureId);
  const person = project.people.find(p => p.id === personId);
  if (!table || !person || seat < 0 || seat >= table.capacity || !Number.isInteger(seat)) return project;
  const occupant = project.people.find(p => p.furnitureId === furnitureId && p.seat === seat);
  return { ...project, people: project.people.map(p => p.id === personId ? { ...p, furnitureId, seat } : p.id === occupant?.id ? { ...p, furnitureId: person.furnitureId, seat: person.seat } : p) };
}
export function editFurniture(project: SeatingProject, id: string, changes: Partial<Omit<Furniture, "id" | "kind">>): SeatingProject {
  const furniture = project.furniture.map(f => f.id === id ? { ...f, ...changes } : f);
  const target = furniture.find(f => f.id === id);
  return { ...project, furniture, people: project.people.map(p => p.furnitureId === id && (p.seat ?? 0) >= (target?.capacity ?? 0) ? { ...p, furnitureId: null, seat: null } : p) };
}
export function removeFurniture(project: SeatingProject, id: string): SeatingProject {
  return { ...project, furniture: project.furniture.filter(f => f.id !== id), people: project.people.map(p => p.furnitureId === id ? { ...p, furnitureId: null, seat: null } : p) };
}
export function seatPositions(f: Furniture) {
  return Array.from({ length: f.capacity }, (_, seat) => {
    if (f.kind === "desk") return { x: 0, y: 36, width: 148, height: 45 };
    if (f.kind === "round") { const angle = -Math.PI / 2 + seat * 2 * Math.PI / f.capacity; return { x: Math.cos(angle) * 91, y: Math.sin(angle) * 80, width: f.capacity > 8 ? 44 : 54, height: 28 }; }
    const top = Math.ceil(f.capacity / 2), bottom = f.capacity - top;
    return { x: seat < top ? -150 + (seat + .5) * 300 / top : -150 + (seat - top + .5) * 300 / bottom, y: seat < top ? -70 : 70, width: top > 4 ? 44 : 65, height: 34 };
  });
}
export function overlappingFurniture(project: SeatingProject) {
  const ids = new Set<string>();
  const objects = project.furniture.filter(f => f.kind !== "label");
  for (let i = 0; i < objects.length; i++) for (let j = i + 1; j < objects.length; j++) {
    const a = objects[i], b = objects[j], ad = dimensions(a.kind), bd = dimensions(b.kind);
    if (Math.abs(a.x-b.x) < (ad.width+bd.width)/2-12 && Math.abs(a.y-b.y) < (ad.height+bd.height)/2-12) { ids.add(a.id); ids.add(b.id); }
  }
  return ids;
}
const fail = () => { throw new Error("That file is not a valid Take Your Seat project. Your current plan is unchanged."); };
export function parseProject(input: unknown): SeatingProject {
  if (!input || typeof input !== "object") return fail();
  const p = input as SeatingProject;
  if (p.version !== 1 || typeof p.title !== "string" || p.title.length > 80 || !Array.isArray(p.furniture) || !Array.isArray(p.people) || p.furniture.length > LIMITS.furniture || p.people.length > LIMITS.people) return fail();
  const ids = new Set<string>();
  const validId = (id: unknown) => typeof id === "string" && id.length > 0 && id.length <= 100 && !ids.has(id);
  const furniture = p.furniture.map(f => {
    if (!f || !validId(f.id) || !["round", "rectangle", "desk", "label"].includes(f.kind) || typeof f.label !== "string" || f.label.length > 40 || !Number.isFinite(f.x) || !Number.isFinite(f.y) || !Number.isInteger(f.capacity) || f.capacity < 0 || f.capacity > 12 || (f.kind === "desk" && f.capacity !== 1) || (f.kind === "label" && f.capacity !== 0) || (["round", "rectangle"].includes(f.kind) && f.capacity < 2)) return fail();
    ids.add(f.id); return { id: f.id, kind: f.kind, label: f.label, ...clampPosition(f.kind, f.x, f.y), capacity: f.capacity };
  });
  const taken = new Set<string>();
  const people = p.people.map(person => {
    if (!person || !validId(person.id) || typeof person.name !== "string" || !person.name.trim() || person.name.length > LIMITS.name) return fail();
    ids.add(person.id);
    if (person.furnitureId !== null || person.seat !== null) {
      const f = furniture.find(f => f.id === person.furnitureId), key = `${person.furnitureId}:${person.seat}`;
      if (!f || !Number.isInteger(person.seat) || (person.seat ?? -1) < 0 || (person.seat ?? 99) >= f.capacity || taken.has(key)) return fail();
      taken.add(key);
    }
    return { id: person.id, name: person.name.trim(), furnitureId: person.furnitureId, seat: person.seat };
  });
  return { version: 1, title: p.title, furniture, people };
}
