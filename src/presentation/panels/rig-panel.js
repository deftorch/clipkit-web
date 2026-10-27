import { el, copyText } from "../dom/h.js";
import { rigState, RIGINFO, rigLabel } from "../../application/state/rig-store.js";

export function renderRig(host, vrmInputEl) {
  if (!host) return;
  host.textContent = '';
  const { rigKey, rig, ctx, meshMsg, rigErr } = rigState;
  const info = RIGINFO[rigKey];

  const top = el('div', { class: 'btnrow' });
  host.append(top);

  const b1 = el('button', { class: 'btn sm primary', type: 'button', text: 'Muat file .vrm' });
  b1.onclick = () => {
    if (vrmInputEl) vrmInputEl.click();
  };
  top.append(b1);

  const b2 = el('button', { class: 'btn sm', type: 'button', text: 'Salin rig JSON' });
  b2.onclick = () => {
    const o = {
      name: rig.name,
      kind: rig.kind || 'motus',
      frame: rig.frame,
      humanoid: rig.humanoid,
      scale: rig.scale,
      pos_scale: rig.pos_scale,
      animated_bones: rig.animated_bones,
      rest: rig.rest,
      channels: rig.channels,
      aims: rig.aims
    };
    copyText(JSON.stringify(o, null, 1), b2);
  };
  top.append(b2);

  top.append(el('span', { class: 'hint', text: 'File dibaca di browser, tidak diunggah.' }));

  if (meshMsg) {
    host.append(
      el('p', {
        class: meshMsg.startsWith('Memuat') ? 'note' : 'pill warn',
        style: 'display:block;border-radius:6px;padding:8px 10px;white-space:normal',
        text: meshMsg
      })
    );
  }
  if (rigErr) {
    host.append(
      el('p', {
        class: 'pill fail',
        style: 'display:block;border-radius:6px;padding:8px 10px;white-space:normal',
        text: rigErr
      })
    );
  }

  host.append(el('h3', { text: rigLabel(rigKey) }));

  const kv = (k, v) => el('tr', {}, el('td', { text: k }), el('td', { class: 'mono', text: v }));
  const rows = [];
  const O = (n) => rig.rest.offsets[ctx.idx[n]];
  const Ln = (n) => Math.hypot(...O(n));

  rows.push(kv('Tinggi pinggul', rig.rest.offsets[0][1].toFixed(3) + ' m'));
  rows.push(kv('Panjang kaki (pinggul ke pergelangan)', (Ln('LeftLeg') + Ln('LeftFoot')).toFixed(3) + ' m'));
  rows.push(kv('Skala tubuh (terhadap MotusMan)', (rig.scale || 1).toFixed(3) + '×'));
  rows.push(kv('Skala gerak pinggul hip_x/y/z', (rig.pos_scale || 1).toFixed(3) + '×'));

  if (info) {
    rows.push(kv('Spesifikasi', 'VRMC_vrm ' + info.spec));
    rows.push(kv('Bone humanoid dari file', `${info.present}/${info.total}${info.synth.length ? ', ' + info.synth.length + ' disintesis' : ''}`));
    rows.push(kv('Bone jari, mata, rahang (33)', `${info.extraPresent || 0} dari file, sisanya offset default`));
    if (info.fileName) rows.push(kv('File', `${info.fileName} (${(info.size / 1048576).toFixed(1)} MB)`));
    if (info.mesh) rows.push(kv('Mesh', `${info.mesh.meshes} objek, ${info.mesh.tris.toLocaleString('id-ID')} segitiga`));
  }
  host.append(el('div', { class: 'scroll' }, el('table', { class: 'map' }, el('tbody', {}, ...rows))));

  if (info && info.synth.length) {
    host.append(el('p', { class: 'note', text: 'Disintesis dari bone di dekatnya karena tidak ada di file: ' + info.synth.join(', ') + '.' }));
  }
  if (info) {
    for (const w of info.warns) {
      host.append(el('div', { class: 'row' }, el('span', { class: 'badge WARN', text: 'WARN' }), el('span', { class: 't', text: w })));
    }
  }

  host.append(el('h3', { text: 'Pemetaan bone' }));
  const hum = rig.humanoid;
  const mapRows = rig.animated_bones.map((n, i) => {
    const w = [0, 0, 0];
    let q = i;
    while (q >= 0) {
      for (let k = 0; k < 3; k++) w[k] += rig.rest.offsets[q][k];
      q = rig.rest.parents[q];
    }
    return el('tr', {},
      el('td', { class: 'mono', text: n }),
      el('td', { class: 'mono', text: hum ? hum[n] : '-' }),
      el('td', { class: 'mono', text: w.map((v) => v.toFixed(3)).join(' ') })
    );
  });
  host.append(el('div', { class: 'scroll' }, el('table', { class: 'map' }, el('thead', {}, el('tr', {}, el('th', { text: 'Bone clipkit' }), el('th', { text: 'Humanoid VRM 1.0' }), el('th', { text: 'Rest x y z (m)' }))), el('tbody', {}, ...mapRows))));

  host.append(el('h3', { text: 'Mengapa klip yang sama berjalan di VRM' }));
  const ul = el('ul', { class: 'note', style: 'padding-left:18px;margin:0' });
  for (const s of [
    'VRM 1.0 memakai frame yang sama dengan rig MotusMan: +X kiri karakter, +Y atas, +Z depan, pose rest T-pose. Karena itu channel (lean, twist, armR_elev, dst.) tidak perlu diubah.',
    'Yang berbeda hanya proporsi: posisi rest tiap sendi dibaca dari file .vrm, termasuk rotasi rest bone asli model.',
    'Gerak pinggul (hip_x/y/z) dikali skala kaki agar tumpuan tetap menapak. Jarak root motion tidak diskalakan.',
    'VRM 0.x ditolak karena menghadap -Z dan memakai ekstensi lain.'
  ]) {
    ul.append(el('li', { text: s }));
  }
  host.append(ul);
}
