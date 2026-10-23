import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

// Production assembly only: approved imagegen masters are never redrawn here.
const out = 'public/images/click';
const master = 'docs/brand/masters';
const palette = {gold:'#F5C76B',cream:'#FFF3D8',teal:'#6FA7A3',charcoal:'#222222',neutral:'#ECE7DD'};
await fs.mkdir(out,{recursive:true});
async function convert(source,name,width=800) {
  const image=sharp(path.join(master,source)).resize({width,withoutEnlargement:true});
  if(name.endsWith('.webp')) await image.webp({quality:90,alphaQuality:100}).toFile(path.join(out,name));
  else await image.png().toFile(path.join(out,name));
}
await convert('click-sitting.png','click-sitting.png');
await convert('click-sitting.png','click-awake-receipt.png',500);
await convert('click-avatar.png','02-icon-avatar.png',512);
await convert('click-avatar.png','Click-Profile.webp',560);
await convert('click-sleeping-labcoat.png','click-sleeping-labcoat.webp',1000);
await convert('click-sleeping-labcoat.png','click-sleeping-meeting-room.webp',1000);
await convert('click-clipboard.png','click-writing.webp',1000);
const svg = (w,h,body)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const fontfile='docs/brand/favorite-child.ttf';
async function lettering(text,width,size,color=palette.charcoal) {
 return sharp({text:{text:`<span foreground="${color}">${text}</span>`,font:`Favorite Child ${size}`,fontfile,width,rgba:true}}).png().toBuffer();
}
const avatar=await sharp(path.join(master,'click-avatar.png')).resize(370,370,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
const title=await lettering('nice little click',760,86);
const lab=await lettering('lab',140,60,palette.teal);
const caption=svg(1200,450,`<text x="430" y="325" font-family="sans-serif" font-size="23" fill="${palette.charcoal}">Tiny tools for oddly specific moments.</text>`);
await sharp({create:{width:1200,height:450,channels:4,background:'#00000000'}}).composite([{input:avatar,left:30,top:35},{input:title,left:420,top:95},{input:lab,left:425,top:210},{input:caption}]).png().toFile(`${out}/01-full-logo.png`);
const badgebase=svg(512,512,`<circle cx="256" cy="256" r="244" fill="${palette.cream}" stroke="${palette.teal}" stroke-width="8"/>`);
const badgeavatar=await sharp(path.join(master,'click-avatar.png')).resize(420,420,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
await sharp(badgebase).composite([{input:badgeavatar,left:46,top:46}]).png().toFile(`${out}/03-badge-circle-mark.png`);
const cursor=`<path d="M77 45 L205 175 L144 181 L178 246 L140 265 L106 199 L64 239 Z" fill="white" stroke="${palette.charcoal}" stroke-width="12" stroke-linejoin="round"/>`;
await sharp(svg(280,300,cursor)).png().toFile(`${out}/04-cursor-tag-detail.png`);
await fs.writeFile('app/icon.svg',svg(64,64,`<rect width="64" height="64" rx="14" fill="${palette.cream}"/><path d="M18 10 L49 41 L35 42 L43 57 L34 61 L26 46 L15 55 Z" fill="white" stroke="${palette.charcoal}" stroke-width="3" stroke-linejoin="round"/>`));
const swatches=Object.entries(palette).map(([name,hex],i)=>`<circle cx="${100+i*200}" cy="100" r="47" fill="${hex}" stroke="#222222" stroke-width="2"/><text x="${100+i*200}" y="185" text-anchor="middle" font-family="sans-serif" font-size="21" fill="#222222">${name}</text><text x="${100+i*200}" y="218" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#222222">${hex}</text>`).join('');
await sharp(svg(1000,260,`<rect width="1000" height="260" fill="white"/>${swatches}`)).png().toFile(`${out}/05-color-palette-and-extra-marks.png`);
const socialTitle=await lettering('nice little click',750,90);
const socialAvatar=await sharp(path.join(master,'click-avatar.png')).resize(400,440,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
const socialText=svg(1200,630,`<text x="460" y="320" font-family="sans-serif" font-size="32" fill="${palette.teal}">LAB</text><text x="460" y="395" font-family="sans-serif" font-size="28" fill="${palette.charcoal}">Tiny tools, games, and gifts</text><text x="460" y="435" font-family="sans-serif" font-size="28" fill="${palette.charcoal}">for oddly specific moments.</text>`);
await sharp({create:{width:1200,height:630,channels:4,background:palette.cream}}).composite([{input:socialAvatar,left:25,top:90},{input:socialTitle,left:445,top:165},{input:socialText}]).png().toFile('public/images/social/nice-little-click-lab-og.png');
await fs.writeFile('docs/brand/palette.json',JSON.stringify(palette,null,2)+'\n');
await fs.writeFile('docs/brand/brand-tokens.css',`:root {\n${Object.entries(palette).map(([n,v])=>`  --brand-${n}: ${v};`).join('\n')}\n}\n`);
console.log('Built Click v2 production assets and palette.');
