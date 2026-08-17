import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import zlib from 'node:zlib'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const ASSETS = join(ROOT, 'public', 'assets')

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf){let c=0xffffffff;for(let i=0;i<buf.length;i++)c=CRC_TABLE[(c^buf[i])&0xff]^(c>>>8);return (c^0xffffffff)>>>0}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const tb=Buffer.from(type,'ascii');const cb=Buffer.alloc(4);cb.writeUInt32BE(crc32(Buffer.concat([tb,data])));return Buffer.concat([len,tb,data,cb])}
function encodePng(w,h,rgba){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;const raw=Buffer.alloc(h*(1+w*4));for(let y=0;y<h;y++){raw[y*(1+w*4)]=0;rgba.copy(raw,y*(1+w*4)+1,y*w*4,(y+1)*w*4)}const idat=zlib.deflateSync(raw,{level:9});return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))])}

function decodePng(filePath){
  const buf=readFileSync(filePath)
  const width=buf.readUInt32BE(16);const height=buf.readUInt32BE(20)
  const colorType=buf[25];const bpp=[null,1,3,null,2,null,4][colorType]||4
  let idat=Buffer.alloc(0);let pos=8
  while(pos<buf.length){const len=buf.readUInt32BE(pos);const type=buf.slice(pos+4,pos+8).toString('ascii');if(type==='IDAT')idat=Buffer.concat([idat,buf.slice(pos+8,pos+8+len)]);pos+=12+len}
  const src=zlib.inflateSync(idat);const rgba=Buffer.alloc(width*height*4);const prev=Buffer.alloc(width*bpp);let sp=0
  for(let y=0;y<height;y++){const f=src[sp++];const row=Buffer.from(src.slice(sp,sp+width*bpp));sp+=width*bpp;const outRow=Buffer.alloc(width*bpp)
    for(let x=0;x<width*bpp;x++){const a=row[x];const left=x>=bpp?outRow[x-bpp]:0;const up=prev[x];const upleft=x>=bpp?prev[x-bpp]:0;let val
      if(f===1)val=(a+left)&255;else if(f===2)val=(a+up)&255;else if(f===3)val=(a+((left+up)>>1))&255;else if(f===4){const p=left+up-upleft;const pa=Math.abs(p-left);const pb=Math.abs(p-up);const pc=Math.abs(p-upleft);const pr=pa<=pb&&pa<=pc?left:pb<=pc?up:upleft;val=(a+pr)&255}else val=a
      outRow[x]=val;rgba[y*width*4+x]=val}
    prev.set(outRow)}
  return {width,height,rgba}
}
function crop(width,height,rgba,x0,x1,y0,y1){
  const w=x1-x0+1;const h=y1-y0+1;const out=Buffer.alloc(w*h*4)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const si=((y0+y)*width+(x0+x))*4;const di=(y*w+x)*4;out[di]=rgba[si];out[di+1]=rgba[si+1];out[di+2]=rgba[si+2];out[di+3]=rgba[si+3]}
  return {width:w,height:h,rgba:out}
}

// Mark regions measured from pixel-column profiles (icon glyph only, no wordmark).
const light=decodePng(join(ASSETS,'logo-light.png'))
const dark=decodePng(join(ASSETS,'logo-dark.png'))
const ml=crop(light.width,light.height,light.rgba,11,117,0,103)
writeFileSync(join(ASSETS,'mark-light.png'),encodePng(ml.width,ml.height,ml.rgba))
const md=crop(dark.width,dark.height,dark.rgba,33,136,0,116)
writeFileSync(join(ASSETS,'mark-dark.png'),encodePng(md.width,md.height,md.rgba))
console.log('mark-light',ml.width+'x'+ml.height)
console.log('mark-dark',md.width+'x'+md.height)
