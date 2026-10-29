const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

export function parseGlbChunks(input) {
  // Terima ArrayBuffer maupun typed array/Buffer Node (mis. hasil fs.readFileSync).
  const buf = ArrayBuffer.isView(input)
    ? input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)
    : input;
  const dv = new DataView(buf);
  if (buf.byteLength < 20 || dv.getUint32(0, true) !== 0x46546c67) {
    throw new Error('Bukan file GLB/VRM (header glTF tidak ditemukan).');
  }
  let off = 12;
  let json = null;
  let binary = null;
  while (off + 8 <= buf.byteLength) {
    const l = dv.getUint32(off, true);
    const t = dv.getUint32(off + 4, true);
    if (t === CHUNK_JSON) {
      json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, off + 8, l)));
    } else if (t === CHUNK_BIN) {
      binary = new Uint8Array(buf, off + 8, l);
    }
    off += 8 + l;
  }
  if (!json) {
    throw new Error('Chunk JSON tidak ditemukan di file.');
  }
  return { json, binary };
}

export function parseGlb(buf) {
  return parseGlbChunks(buf).json;
}

// Matriks kolom-mayor 4x4
export const mul4 = (a, b) => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
};

export function trs(n) {
  if (n.matrix) return n.matrix.slice();
  const t = n.translation || [0, 0, 0],
    q = n.rotation || [0, 0, 0, 1],
    s = n.scale || [1, 1, 1];
  const [x, y, z, w] = q;
  const m = [
    1 - 2 * (y * y + z * z),
    2 * (x * y + z * w),
    2 * (x * z - y * w),
    0,
    2 * (x * y - z * w),
    1 - 2 * (x * x + z * z),
    2 * (y * z + x * w),
    0,
    2 * (x * z + y * w),
    2 * (y * z - x * w),
    1 - 2 * (x * x + y * y),
    0,
    0,
    0,
    0,
    1,
  ];
  for (let i = 0; i < 3; i++) {
    m[i] *= s[0];
    m[4 + i] *= s[1];
    m[8 + i] *= s[2];
  }
  m[12] = t[0];
  m[13] = t[1];
  m[14] = t[2];
  return m;
}

export function worldPositions(gltf) {
  const W = new Array(gltf.nodes.length),
    I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const visit = (i, pm) => {
    const m = mul4(pm, trs(gltf.nodes[i]));
    W[i] = m;
    for (const c of gltf.nodes[i].children || []) visit(c, m);
  };
  const sc = gltf.scenes?.[gltf.scene ?? 0];
  for (const r of sc ? sc.nodes : [0]) visit(r, I4);
  return W.map((m) => (m ? [m[12], m[13], m[14]] : null));
}
