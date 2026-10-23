"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { ROOM, LIMITS, assignPerson, clampPosition, createProject, dimensions, editFurniture, overlappingFurniture, parseProject, removeFurniture, seatPositions, type FurnitureKind, type SeatingProject, type Template } from "@/lib/seating";
import styles from "./seating.module.css";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const tableColors = ["#f6d3c8", "#d6e8d9", "#e4dcf1", "#f9e4a9", "#d5e7ed", "#f2dbe5"];

function Flower({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return <g transform={`translate(${x} ${y})`} aria-hidden="true" pointerEvents="none">
    {[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cx="0" cy="-7" rx="4.5" ry="6" transform={`rotate(${angle})`} fill="#fffdf5" stroke="#39352f" strokeWidth="1.5" />)}
    <circle r="4" fill="#f5c76b" stroke="#39352f" strokeWidth="1.5" />
  </g>;
}

function LayoutPicture({ kind }: { kind: Template }) {
  return <svg viewBox="0 0 96 62" aria-hidden="true" fill="none" stroke="#39352f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {kind === "wedding" ? <>
      <rect x="19" y="5" width="17" height="11" rx="5" fill="#d6e8d9" /><rect x="60" y="5" width="17" height="11" rx="5" fill="#e4dcf1" />
      <rect x="19" y="44" width="17" height="11" rx="5" fill="#e4dcf1" /><rect x="60" y="44" width="17" height="11" rx="5" fill="#d6e8d9" />
      <ellipse cx="48" cy="30" rx="32" ry="18" fill="#f6d3c8" /><Flower x={48} y={30} />
    </> : kind === "classroom" ? <>
      <rect x="20" y="4" width="56" height="14" rx="4" fill="#d6e8d9" /><path d="M34 11h28" />
      {[20, 55].map(x => <g key={x}><rect x={x} y="28" width="23" height="17" rx="5" fill="#f9e4a9" /><rect x={x+3} y="49" width="17" height="7" rx="3" fill="#d5e7ed" /><path d={`M${x+7} 33l7 6`} /></g>)}
    </> : <>
      <rect x="21" y="5" width="48" height="50" rx="7" fill="#fffdf5" transform="rotate(-7 45 30)" /><path d="M39 30h18m-9-9v18" stroke="#6b8975" />
      <path d="m72 9 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#f5c76b" />
    </>}
  </svg>;
}

export function SeatingChartBuilder() {
  const [project, setProject] = useState<SeatingProject>(() => createProject("wedding"));
  const [history, setHistory] = useState<SeatingProject[]>([]);
  const [panel, setPanel] = useState<"room" | "people">("room");
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [names, setNames] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Start with a room, then add your people.");
  const svg = useRef<SVGSVGElement>(null), fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; base: SeatingProject; moved: boolean } | null>(null);
  const furniture = project.furniture.find(f => f.id === selectedFurniture);
  const person = project.people.find(p => p.id === selectedPerson);
  const assigned = project.people.filter(p => p.furnitureId !== null).length;
  const capacity = project.furniture.reduce((n, f) => n + f.capacity, 0);
  const overlaps = overlappingFurniture(project);
  const full = project.furniture.filter(f => f.capacity > 0 && project.people.filter(p => p.furnitureId === f.id).length === f.capacity).length;
  const displayName = (id: string) => {
    const p = project.people.find(p => p.id === id);
    if (!p) return "";
    const same = project.people.filter(other => other.name === p.name);
    return same.length > 1 ? `${p.name} (${same.findIndex(other => other.id === id) + 1})` : p.name;
  };
  const short = (value: string, length: number) => Array.from(value).length > length ? Array.from(value).slice(0, length - 1).join("") + "…" : value;
  const seatOptions = project.furniture.flatMap((f, index) => Array.from({ length: f.capacity }, (_, seat) => ({ furnitureId: f.id, seat, value: `${index}-${seat}`, label: `${f.label || "Untitled"} · seat ${seat + 1}` })));

  function commit(next: SeatingProject) {
    if (next === project) return;
    setHistory(h => [...h.slice(-49), project]); setProject(next);
  }
  function undo() {
    const previous = history[history.length - 1]; if (!previous) return;
    setProject(previous); setHistory(h => h.slice(0, -1)); setMessage("Last change undone.");
  }
  function applyTemplate(template: Template) {
    commit({ ...createProject(template), people: project.people.map(p => ({ ...p, furnitureId: null, seat: null })) });
    setSelectedFurniture(null); setMessage("Room replaced. Names kept and seats cleared. Undo restores the previous room.");
  }
  function addFurniture(kind: FurnitureKind) {
    if (project.furniture.length >= LIMITS.furniture) { setMessage("This room supports up to 48 items."); return; }
    const id = crypto.randomUUID(), count = project.furniture.filter(f => f.kind === kind).length + 1;
    const label = kind === "desk" ? `Desk ${count}` : kind === "label" ? "Door / front" : `Table ${project.furniture.filter(f => f.kind === "round" || f.kind === "rectangle").length + 1}`;
    const next = { id, kind, label, x: 600 + (count % 3) * 30, y: 400 + (count % 3) * 30, capacity: kind === "desk" ? 1 : kind === "label" ? 0 : kind === "round" ? 8 : 6 };
    commit({ ...project, furniture: [...project.furniture, next] }); setSelectedFurniture(id); setMessage(`${label} added. Drag it into place, or use the position controls.`);
  }
  function addPeople() {
    const entries = names.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!entries.length) { setMessage("Add at least one name, one per line."); return; }
    if (entries.some(name => name.length > LIMITS.name)) { setMessage("Keep each name to 80 characters or fewer. No names have been added."); return; }
    if (project.people.length + entries.length > LIMITS.people) { setMessage("This chart supports up to 240 people. No names have been added."); return; }
    const people = entries.map(name => ({ id: crypto.randomUUID(), name, furnitureId: null, seat: null }));
    commit({ ...project, people: [...project.people, ...people] }); setNames(""); setSelectedPerson(people[0].id); setMessage(`${entries.length} names added. Choose a name and tap a seat.`);
  }
  function assign(furnitureId: string, seat: number) {
    if (!person) { const occupant = project.people.find(p => p.furnitureId === furnitureId && p.seat === seat); if (occupant) { setSelectedPerson(occupant.id); setPanel("people"); } else { setMessage("Choose a person in the People panel, then tap this seat."); setPanel("people"); } return; }
    const occupant = project.people.find(p => p.furnitureId === furnitureId && p.seat === seat && p.id !== person.id);
    commit(assignPerson(project, person.id, furnitureId, seat));
    setMessage(occupant ? `${displayName(person.id)} moved. ${displayName(occupant.id)} ${person.furnitureId ? "swapped into the previous seat" : "is now unassigned"}.` : `${displayName(person.id)} assigned to seat ${seat + 1}.`);
  }
  function changeSeat(value: string) {
    if (!person) return;
    const option = seatOptions.find(option => option.value === value);
    if (option) assign(option.furnitureId, option.seat);
    else {
      commit({ ...project, people: project.people.map(p => p.id === person.id ? { ...p, furnitureId: null, seat: null } : p) });
      setMessage(`${displayName(person.id)} is now unassigned.`);
    }
  }
  function nextUnseated() {
    const index = project.people.findIndex(p => p.id === selectedPerson);
    const ordered = [...project.people.slice(index + 1), ...project.people.slice(0, index + 1)];
    const next = ordered.find(p => p.furnitureId === null);
    if (next) { setSelectedPerson(next.id); setMessage(`${displayName(next.id)} selected. Choose an empty seat.`); }
    else setMessage("Everyone on the list has a seat.");
  }
  function point(event: PointerEvent<SVGElement>) {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }
  function startDrag(event: PointerEvent<SVGGElement>, id: string) {
    if (event.button !== 0) return;
    const f = project.furniture.find(f => f.id === id), p = point(event); if (!f || !p) return;
    event.currentTarget.setPointerCapture(event.pointerId); setSelectedFurniture(id);
    drag.current = { id, dx: p.x-f.x, dy: p.y-f.y, base: project, moved: false };
  }
  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    const d = drag.current, p = point(event); if (!d || !p) return;
    const f = d.base.furniture.find(f => f.id === d.id); if (!f) return;
    const position = clampPosition(f.kind, Math.round(p.x-d.dx), Math.round(p.y-d.dy));
    d.moved = d.moved || Math.abs(position.x-f.x) + Math.abs(position.y-f.y) > 2;
    setProject({ ...d.base, furniture: d.base.furniture.map(item => item.id === d.id ? { ...item, ...position } : item) });
  }
  function finishDrag() {
    const d = drag.current; if (d?.moved) setHistory(h => [...h.slice(-49), d.base]); drag.current = null;
  }
  async function openProject(file?: File) {
    if (!file) return;
    try { if (file.size > 1_000_000) throw new Error("Choose a project file smaller than 1 MB."); const next = parseProject(JSON.parse(await file.text())); commit(next); setSelectedFurniture(null); setSelectedPerson(null); setMessage("Project opened. Your previous plan is available with Undo."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "This file could not be opened."); }
    if (fileInput.current) fileInput.current.value = "";
  }
  function exportSvg() {
    if (!svg.current) return;
    const clone = svg.current.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-editor-only]").forEach(node => node.remove());
    clone.querySelectorAll('[data-person-selected="true"]').forEach(node => { const box=node.querySelector("rect:last-of-type"), text=node.querySelector("text"); box?.setAttribute("fill", "#dcebe5"); box?.setAttribute("stroke", "#6fa7a3"); text?.setAttribute("fill", "#222222"); });
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    download(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }), "take-your-seat-room.svg");
    setMessage("Room image saved. Print the chart for the full assignment list.");
  }

  return <div className={styles.builder}>
    <div className={styles.intro}>
      <div><p className="lab-label">Click 008 · Free · No account</p><h1 className="font-display">Take Your Seat<span aria-hidden="true" className={styles.titleFlower}>✿</span></h1><p>Make room for everyone. Then put their name on it.</p></div>
      <div className={styles.mascot}><span className={styles.mascotNote}>A place for your favorite people.</span><Image src="/images/click/click-sitting.png" alt="" width={160} height={168} className={styles.click} /></div>
    </div>
    <div className={styles.toolbar} aria-label="Project actions">
      <button type="button" onClick={undo} disabled={!history.length}>↶ Undo</button>
      <button type="button" onClick={() => { download(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }), "take-your-seat.json"); setMessage("Project saved. Reopen this file here to keep editing."); }}>Save project</button>
      <button type="button" onClick={() => fileInput.current?.click()}>Open project</button>
      <input ref={fileInput} type="file" accept=".json,application/json" className={styles.file} aria-label="Open seating project file" onChange={event => void openProject(event.target.files?.[0])} />
      <button type="button" onClick={exportSvg}>Save room image</button>
      <button type="button" className={styles.primary} onClick={() => window.print()}>Print / Save PDF</button>
    </div>
    <p className={styles.status} role="status">{message}</p>
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="Chart controls">
        <div className={styles.tabs}><button type="button" aria-pressed={panel === "room"} onClick={() => setPanel("room")}>1. Your room</button><button type="button" aria-pressed={panel === "people"} onClick={() => setPanel("people")}>2. Your people</button></div>
        {panel === "room" ? <>
          <label className={styles.field}>Chart title<input value={project.title} maxLength={80} onChange={e => commit({ ...project, title: e.target.value })} /></label>
          <fieldset><legend>Start with a layout</legend><div className={styles.layoutCards}>{([['wedding','Wedding'],['classroom','Classroom'],['blank','Blank room']] as const).map(([key, label]) => <button type="button" key={key} onClick={() => applyTemplate(key)}><LayoutPicture kind={key} /><span>{label}</span></button>)}</div><p className={styles.hint}>Replaces the room and clears seats. Your names stay.</p></fieldset>
          <fieldset><legend>Add to the room</legend><div className={styles.addGrid}>{([['round','◯ Round table'],['rectangle','▭ Long table'],['desk','▱ Desk'],['label','＋ Room label']] as const).map(([kind,label]) => <button type="button" key={kind} disabled={project.furniture.length >= LIMITS.furniture} onClick={() => addFurniture(kind)}>{label}</button>)}</div></fieldset>
          {furniture ? <fieldset><legend>Edit selected item</legend>
            <label className={styles.field}>Name<input maxLength={40} value={furniture.label} onChange={e => commit(editFurniture(project, furniture.id, { label: e.target.value }))} /></label>
            {(furniture.kind === "round" || furniture.kind === "rectangle") && <label className={styles.field}>Seats<select value={furniture.capacity} onChange={e => { commit(editFurniture(project, furniture.id, { capacity: Number(e.target.value) })); setMessage("Seat count updated. Anyone whose seat was removed is now unassigned."); }}>{Array.from({ length:11 },(_,i)=><option key={i+2}>{i+2}</option>)}</select></label>}
            <p className={styles.hint}>Drag the item, use its arrow keys, or adjust its position here.</p>
            <label className={styles.field}>Left / right<input type="range" min={dimensions(furniture.kind).width / 2} max={ROOM.width-dimensions(furniture.kind).width/2} step="10" value={furniture.x} onChange={e => commit(editFurniture(project, furniture.id, { x: Number(e.target.value) }))} /></label>
            <label className={styles.field}>Up / down<input type="range" min={dimensions(furniture.kind).height / 2} max={ROOM.height-dimensions(furniture.kind).height/2} step="10" value={furniture.y} onChange={e => commit(editFurniture(project, furniture.id, { y: Number(e.target.value) }))} /></label>
            <button type="button" className={styles.danger} onClick={() => { commit(removeFurniture(project, furniture.id)); setSelectedFurniture(null); setMessage("Item removed. Its people are now unassigned."); }}>Remove item</button>
          </fieldset> : <p className={styles.hint}>Select a table, desk, or label to edit it.</p>}
        </> : <>
          <label className={styles.field}>Names, one per line<textarea rows={4} value={names} onChange={e => setNames(e.target.value)} placeholder={"Alex Rivera\nJordan Lee\nMorgan Bell"} /></label>
          <button type="button" className={styles.primary} onClick={addPeople}>Add names</button>
          <p className={styles.hint}>Choose a name below, then tap a seat. Selecting an occupied seat swaps assigned people; an unassigned person sends its occupant back to the list.</p>
          <label className={styles.field}>Find a person<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search names" /></label>
          <div className={styles.roster} aria-label="People">{project.people.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => <button type="button" key={p.id} aria-pressed={p.id === selectedPerson} onClick={() => { setSelectedPerson(p.id); setMessage(`${displayName(p.id)} selected. Tap a seat or use the assignment menu.`); }}><span>{displayName(p.id)}</span><small>{p.furnitureId ? `${project.furniture.find(f=>f.id===p.furnitureId)?.label || "Untitled"} · ${Number(p.seat)+1}` : "Needs a seat"}</small></button>)}{!project.people.length && <p className={styles.hint}>The room is ready for its people.</p>}</div>
          {person && <fieldset><legend>Selected person</legend>
            <label className={styles.field}>Name<input maxLength={80} value={person.name} onChange={e => { const name = e.target.value; if (name.trim()) commit({ ...project, people: project.people.map(p=>p.id===person.id ? {...p,name} : p) }); }} /></label>
            <label className={styles.field}>Seat assignment<select value={seatOptions.find(o=>o.furnitureId===person.furnitureId && o.seat===person.seat)?.value || "unassigned"} onChange={e=>changeSeat(e.target.value)}><option value="unassigned">Unassigned</option>{seatOptions.map(option=><option key={option.value} value={option.value}>{option.label}{project.people.some(p=>p.furnitureId===option.furnitureId&&p.seat===option.seat&&p.id!==person.id) ? " (occupied)" : ""}</option>)}</select></label>
            <button type="button" className={styles.danger} onClick={()=>{commit({...project,people:project.people.filter(p=>p.id!==person.id)});setSelectedPerson(null);setMessage("Person removed. Undo can bring them back.");}}>Remove person</button>
          </fieldset>}
        </>}
        <p className={styles.privacy}>Your names stay in this browser tab. Save a project file before leaving; there’s no automatic save.</p>
      </aside>
      <section className={styles.planSection} aria-label="Room plan">
        <div className={styles.planHeading}><div><p className="lab-label">✿ Your happy gathering</p><h2>{project.title || "Untitled chart"}</h2></div><div className={styles.counts}><span><strong>{assigned}/{project.people.length}</strong> seated</span><span><strong>{capacity-assigned}</strong> empty seats</span><span><strong>{full}</strong> full tables / desks</span></div></div>
        {project.people.length > 0 && <div className={styles.placementBar} aria-label="Seat people without leaving the room">
          <label className={styles.field}>Place this person<select value={selectedPerson || ""} onChange={e => { setSelectedPerson(e.target.value || null); setMessage(e.target.value ? `${displayName(e.target.value)} selected. Tap a seat or choose one below.` : "Choose a person to place."); }}><option value="">Choose a person</option>{project.people.map(p => <option key={p.id} value={p.id}>{displayName(p.id)}{p.furnitureId === null ? " · unseated" : " · seated"}</option>)}</select></label>
          <label className={styles.field}>Choose their seat<select disabled={!person} value={seatOptions.find(o=>o.furnitureId===person?.furnitureId && o.seat===person?.seat)?.value || "unassigned"} onChange={e=>changeSeat(e.target.value)}><option value="unassigned">Unassigned</option>{seatOptions.map(option => { const occupant=project.people.find(p=>p.furnitureId===option.furnitureId&&p.seat===option.seat&&p.id!==person?.id); return <option key={option.value} value={option.value}>{option.label}{occupant ? ` · occupied by ${displayName(occupant.id)}` : ""}</option>; })}</select></label>
          <button type="button" disabled={assigned===project.people.length} onClick={nextUnseated}>Next unseated →</button>
        </div>}
        <p className={styles.planHelp}>{person ? `Placing ${displayName(person.id)}. Tap any seat.` : "Drag furniture to arrange your room. Tap an item to edit it."} Swipe the room sideways on smaller screens.</p>
        {project.people.length > capacity && <p className={styles.warning}>You need {project.people.length-capacity} more seats for everyone.</p>}
        {overlaps.size > 0 && <p className={styles.warning}>Some furniture overlaps. Move the highlighted items apart before printing.</p>}
        <div className={styles.canvasScroll}>
          <svg ref={svg} viewBox={`0 0 ${ROOM.width} ${ROOM.height}`} className={styles.canvas} aria-label="Interactive seating plan. Furniture and seats can be selected with the keyboard." onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
            <title>{project.title || "Seating chart"}</title><desc>Room layout with named seats. The full names and assignments are also listed below.</desc>
            <rect width={ROOM.width} height={ROOM.height} fill="#fffdf5" />
            <g aria-hidden="true" pointerEvents="none">
              <rect x="14" y="14" width={ROOM.width-28} height={ROOM.height-28} rx="28" fill="none" stroke="#d8cdbb" strokeWidth="2" strokeDasharray="3 9" />
              {!project.furniture.some(f => f.kind === "desk") && <><path d="M32 30 Q600 110 1168 30" fill="none" stroke="#39352f" strokeWidth="2" />
              {[110, 230, 350, 470, 590, 710, 830, 950, 1070].map((x, i) => <path key={x} d={`M${x-15} ${39+Math.sin(i/8*Math.PI)*28} l30 0 -15 24Z`} fill={tableColors[i%tableColors.length]} stroke="#39352f" strokeWidth="2" strokeLinejoin="round" />)}</>}
              <Flower x={42} y={ROOM.height-38} /><Flower x={ROOM.width-42} y={ROOM.height-38} />
            </g>
            <defs><pattern id="seat-grid" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#e8e1d4" /></pattern></defs><rect width={ROOM.width} height={ROOM.height} fill="url(#seat-grid)" data-editor-only="true" />
            {!project.furniture.length && <text x="600" y="400" textAnchor="middle" fontSize="25" fill="#6e665d">Your room, your arrangement. Add an item to begin.</text>}
            {project.furniture.map((f, furnitureIndex) => {
              const seated = project.people.filter(p=>p.furnitureId===f.id).length, active = selectedFurniture===f.id;
              const color = tableColors[furnitureIndex % tableColors.length];
              return <g key={f.id} transform={`translate(${f.x} ${f.y})`}>
                {(active || overlaps.has(f.id)) && <rect data-editor-only="true" x={-dimensions(f.kind).width/2+2} y={-dimensions(f.kind).height/2+2} width={dimensions(f.kind).width-4} height={dimensions(f.kind).height-4} rx="20" fill="none" stroke={overlaps.has(f.id) ? "#a34624" : "#315f5b"} strokeWidth="3" strokeDasharray="7 5" />}
                <g role="button" tabIndex={0} aria-label={`Move or edit ${f.label || "Untitled item"}`} onPointerDown={e=>startDrag(e,f.id)} onClick={()=>setSelectedFurniture(f.id)} onKeyDown={e=>{
                  if(e.key==="Enter" || e.key===" "){e.preventDefault();setSelectedFurniture(f.id);setPanel("room");}
                  const offset=({ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]} as Record<string,number[]>)[e.key];
                  if(offset){e.preventDefault();commit(editFurniture(project,f.id,clampPosition(f.kind,f.x+offset[0],f.y+offset[1])));}
                }} className={styles.furniture}>
                  {f.kind==="round" ? <>
                    <ellipse cx="0" cy="5" rx="61" ry="49" fill="#39352f" opacity=".14" />
                    <ellipse cx="0" cy="0" rx="59" ry="48" fill={color} stroke="#39352f" strokeWidth="4" />
                    <ellipse cx="0" cy="0" rx="50" ry="39" fill="none" stroke="#fffdf5" strokeWidth="2" strokeDasharray="2 5" />
                    <Flower y={-25} />
                  </> : <>
                    <rect x={f.kind==="label" ? -88 : f.kind==="rectangle" ? -135 : -83} y={f.kind==="desk" ? -40 : -23} width={f.kind==="label" ? 176 : f.kind==="rectangle" ? 270 : 166} height={f.kind==="desk" ? 59 : 54} rx="16" fill="#39352f" opacity=".14" />
                    <rect x={f.kind==="label" ? -88 : f.kind==="rectangle" ? -135 : -83} y={f.kind==="desk" ? -44 : -27} width={f.kind==="label" ? 176 : f.kind==="rectangle" ? 270 : 166} height={f.kind==="desk" ? 59 : 54} rx="16" fill={f.kind==="label" ? "#d6e8d9" : color} stroke="#39352f" strokeWidth="4" />
                    {f.kind==="rectangle" && <><Flower x={-108} /><Flower x={108} /></>}
                    {f.kind==="desk" && <path d="m57-29 8 3-2 5-8-3Z" fill="#fffdf5" stroke="#39352f" strokeWidth="1.5" />}
                  </>}
                  <text x="0" y={f.kind==="desk" ? -16 : -2} textAnchor="middle" fontFamily="Trebuchet MS,system-ui,sans-serif" fontSize="15" fontWeight="700" fill="#222222">{short(f.label || "Untitled",18)}</text>
                  {f.capacity>0 && <text x="0" y={f.kind==="desk" ? 1 : 18} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="12" fill="#554d45">{seated}/{f.capacity} seated</text>}
                </g>
                {seatPositions(f).map((position,seat)=>{
                  const occupant=project.people.find(p=>p.furnitureId===f.id&&p.seat===seat), chosen=occupant?.id===selectedPerson;
                  return <g key={seat} role="button" tabIndex={0} data-person-selected={chosen} aria-label={`${f.label}, seat ${seat+1}: ${occupant ? displayName(occupant.id) : "empty"}`} className={styles.seat} transform={`translate(${position.x} ${position.y})`} onClick={()=>assign(f.id,seat)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();assign(f.id,seat);}}}>
                    <title>{occupant ? displayName(occupant.id) : `Empty seat ${seat+1}`}</title>
                    <rect x={-position.width/2} y={-position.height/2+4} width={position.width} height={position.height} rx="11" fill="#39352f" opacity=".13" pointerEvents="none" />
                    <rect x={-position.width/2} y={-position.height/2} width={position.width} height={position.height} rx="11" fill={chosen ? "#315f5b" : occupant ? "#c4ddce" : "#fffaf0"} stroke="#39352f" strokeWidth="2.5" />
                    <text x="0" y="4" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize={f.kind==="desk" ? 13 : 10} fill={chosen ? "#ffffff" : "#222222"}>{occupant ? short(displayName(occupant.id),f.kind==="desk" ? 20 : position.width<50 ? 6 : 8) : seat+1}</text>
                  </g>;
                })}
              </g>;
            })}
          </svg>
        </div>
        <div className={styles.legend}><span><i className={styles.emptyDot} /> Empty seat</span><span><i className={styles.assignedDot} /> Assigned</span><span>Dark teal = selected person</span></div>
        <section className={styles.assignments} aria-label="Full assignment list"><h2>Who’s sitting where</h2><p className={styles.hint}>Full names are listed here when the room preview shortens them.</p><div className={styles.assignmentGrid}>{project.furniture.filter(f=>f.capacity>0).map(f=><div key={f.id} className={styles.assignmentCard}><h3>{f.label || "Untitled"} <small>{project.people.filter(p=>p.furnitureId===f.id).length}/{f.capacity}</small></h3><ol>{Array.from({length:f.capacity},(_,seat)=>{const p=project.people.find(p=>p.furnitureId===f.id&&p.seat===seat);return <li key={seat}>{p ? displayName(p.id) : <span className={styles.empty}>Empty</span>}</li>;})}</ol></div>)}</div><div className={styles.unassigned}><h3>Still needs a seat ({project.people.length-assigned})</h3><p>{project.people.filter(p=>p.furnitureId===null).map(p=>displayName(p.id)).join(" · ") || "Everyone on the list has a seat."}</p></div></section>
        <p className={styles.printFooter}>Made with Take Your Seat · Nice Little Click Lab · Layout illustration, not a measured floor plan.</p>
      </section>
    </div>
  </div>;
}
