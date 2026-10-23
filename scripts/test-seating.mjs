import test from 'node:test';
import assert from 'node:assert/strict';
import { assignPerson, clampPosition, createProject, dimensions, editFurniture, overlappingFurniture, parseProject, removeFurniture, ROOM, seatPositions } from '../lib/seating.ts';
function example() {
  const project = createProject('wedding');
  project.people = [
    {id:'a',name:'Alex',furnitureId:'table-0',seat:0},
    {id:'b',name:'Blair',furnitureId:'table-1',seat:2},
    {id:'c',name:'Alex',furnitureId:null,seat:null},
  ]; return project;
}
test('moving an assigned person swaps occupants without losing names',()=>{
  const p=example(), result=assignPerson(p,'a','table-1',2);
  assert.equal(result.people[0].furnitureId,'table-1'); assert.equal(result.people[0].seat,2);
  assert.equal(result.people[1].furnitureId,'table-0'); assert.equal(result.people[1].seat,0);
  assert.equal(p.people[0].furnitureId,'table-0'); assert.equal(result.people.length,3);
});
test('an unassigned person taking an occupied seat unassigns its occupant',()=>{
  const result=assignPerson(example(),'c','table-0',0);
  assert.equal(result.people[0].furnitureId,null); assert.equal(result.people[0].seat,null);
  assert.equal(result.people[2].furnitureId,'table-0');
});
test('invalid seat assignments make no change',()=>{
  const p=example();for(const seat of [-1,8,1.5])assert.equal(assignPerson(p,'a','table-0',seat),p);
  assert.equal(assignPerson(p,'missing','table-0',1),p);
});
test('removing furniture and reducing capacity release affected people',()=>{
  assert.equal(removeFurniture(example(),'table-1').people[1].seat,null);
  const reduced=editFurniture(example(),'table-1',{capacity:2});
  assert.equal(reduced.people[1].furnitureId,null);assert.equal(reduced.people[0].seat,0);
});
test('templates have nonoverlapping furniture and stay within room boundaries',()=>{
  for(const type of ['classroom','wedding','blank']){
    const p=createProject(type);assert.equal(overlappingFurniture(p).size,0);
    for(const f of p.furniture){const d=dimensions(f.kind);assert.ok(f.x-d.width/2>=0);assert.ok(f.y-d.height/2>=0);assert.ok(f.x+d.width/2<=ROOM.width);assert.ok(f.y+d.height/2<=ROOM.height);assert.equal(seatPositions(f).length,f.capacity);}
  }
  assert.deepEqual(clampPosition('round',-999,9999),{x:125,y:685});
});
test('saved project round trip preserves duplicate and Unicode names',()=>{
  const p=example();p.people[0].name='Álex 王';assert.deepEqual(parseProject(JSON.parse(JSON.stringify(p))),p);
});
test('reject malformed imports, duplicate occupied seats and unsafe field types',()=>{
  for(const input of [null,{}, {version:1,title:[],furniture:[],people:[]}, {...example(),version:2}])assert.throws(()=>parseProject(input));
  const duplicate=example();duplicate.people[1]={...duplicate.people[1],furnitureId:'table-0',seat:0};assert.throws(()=>parseProject(duplicate));
  const wrongSeat=example();wrongSeat.people[0].seat=99;assert.throws(()=>parseProject(wrongSeat));
  const unknown=example();unknown.people[0].furnitureId='missing';assert.throws(()=>parseProject(unknown));
  const wrongId=example();wrongId.people[1].id='a';assert.throws(()=>parseProject(wrongId));
  const tooMany=example();tooMany.people=Array.from({length:241},(_,i)=>({id:`p-${i}`,name:'Person',furnitureId:null,seat:null}));assert.throws(()=>parseProject(tooMany));
});
test('overlaps are reported without moving or deleting furniture',()=>{
  const p=example();p.furniture[1]={...p.furniture[1],x:p.furniture[0].x,y:p.furniture[0].y};
  assert.ok(overlappingFurniture(p).has('table-0'));assert.ok(overlappingFurniture(p).has('table-1'));
});
