const LZWCompressor = {
  CHARS: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-*/=<>!@#$%^&()[]{}|;:,.?~ ',

  encode(codes) {
    if (!Array.isArray(codes) || codes.length === 0) {
      throw new Error('Invalid codes array');
    }

    const bytes = [];
    let bits = 0, nb = 0;
    let width = 9, limit = 512, size = 258;

    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (typeof c !== 'number' || c < 0 || c > 65535 || !Number.isFinite(c)) {
        throw new Error(`Invalid code at index ${i}: ${c}`);
      }

      bits |= c << nb;
      nb += width;

      while (nb >= 8) {
        bytes.push(bits & 255);
        bits >>= 8;
        nb -= 8;
      }

      size++;
      if (size > limit && width < 16) {
        width++;
        limit <<= 1;
      }
    }

    if (nb > 0) bytes.push(bits & 255);

    let out = '';
    for (let i = 0; i < bytes.length; i += 4) {
      let v =
        (bytes[i] || 0) |
        ((bytes[i + 1] || 0) << 8) |
        ((bytes[i + 2] || 0) << 16) |
        ((bytes[i + 3] || 0) << 24);

      v >>>= 0;
      
      for (let j = 0; j < 5; j++) {
        const idx = v % 85;
        if (idx < 0 || idx >= this.CHARS.length) {
          throw new Error('Encoding index out of range');
        }
        out += this.CHARS[idx];
        v = Math.floor(v / 85);
      }
    }
    return out;
  },

  compress(input) {
    try {
      if (typeof input !== 'string') {
        throw new Error('Input must be a string');
      }

      if (input.trim().length === 0) {
        throw new Error('Input is empty');
      }

      let cleaned = CommentRemover.removeLuaComments(input);
      if (!cleaned.trim()) {
        throw new Error('No code remaining after removing comments');
      }

      const encoder = new TextEncoder();
      let bytes;
      try {
        bytes = encoder.encode(cleaned);
      } catch (encodeError) {
        throw new Error('Invalid Unicode characters in code');
      }

      if (bytes.length === 0) {
        throw new Error('No compressible content found');
      }

      const dict = new Map();
      for (let i = 0; i < 256; i++) {
        dict.set(String.fromCharCode(i), i);
      }

      let w = '';
      let size = 256;
      const codes = [];
      const maxDictSize = 65536;

      for (const b of bytes) {
        const c = String.fromCharCode(b);
        const wc = w + c;
        if (dict.has(wc)) {
          w = wc;
        } else {
          const code = dict.get(w);
          if (code === undefined) {
            throw new Error('Dictionary lookup failed');
          }
          codes.push(code);
          if (size < maxDictSize) {
            dict.set(wc, size++);
          }
          w = c;
        }
      }
      
      if (w) {
        const code = dict.get(w);
        if (code === undefined) {
          throw new Error('Final dictionary lookup failed');
        }
        codes.push(code);
      }

      if (codes.length === 0) {
        throw new Error('No compressible content found');
      }

      const enc = this.encode(codes);
      if (!enc || enc.length === 0) {
        throw new Error('Encoding failed');
      }

      const escapedEnc = enc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const escapedChars = this.CHARS.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

      if (codes.length > 1000000) {
        throw new Error('Compressed output too large');
      }

      return `return(function(s,n)local C="${escapedChars}"local B,b,w,t,z={},0,9,512,258;for i=1,#s,5 do local v=0;for j=0,4 do v=v+((C:find(s:sub(i+j,i+j),1,1)or 1)-1)*85^j end;for k=0,3 do B[#B+1]=v//256^k%256 end end;local E,x,y={},1,0;for i=1,n do while y<w do b=b+(B[x]or 0)*2^y;x=x+1;y=y+8 end;E[i]=b%2^w;b=b//2^w;y=y-w;z=z+1;if z>t and w<16 then w=w+1;t=t*2 end end;local D,R={},{}for i=0,255 do D[i]=string.char(i)end;local p=D[E[1]]or""R[1]=p;local d=256;for i=2,n do local c=E[i]local e=D[c]if e then R[i]=e;if p~=""then D[d]=p..e:sub(1,1)end elseif c==d then e=p..p:sub(1,1);R[i]=e;D[d]=e else R[i]=""end;d=d+1;p=e or p end;return loadstring(table.concat(R))end)("${escapedEnc}",${codes.length})(...)`;
    } catch (error) {
      throw new Error(`Compression failed: ${error.message}`);
    }
  }
};