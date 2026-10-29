/**
 * Pure JavaScript 2D rendering context that records standard Canvas 2D calls
 * into clean, deterministic Scalable Vector Graphics (SVG).
 * Enables headless rendering in Node environments with zero native dependencies.
 */

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class SvgContext2D {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.elements = [];
    this.currentPath = '';
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.lineCap = 'butt';
    this.lineDash = [];
    this.globalAlpha = 1;
    this.font = '12px sans-serif';
    this.textAlign = 'left';
    this.stateStack = [];
  }

  save() {
    this.stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineCap: this.lineCap,
      lineDash: [...this.lineDash],
      globalAlpha: this.globalAlpha,
      font: this.font,
      textAlign: this.textAlign,
    });
  }

  restore() {
    const s = this.stateStack.pop();
    if (s) {
      this.fillStyle = s.fillStyle;
      this.strokeStyle = s.strokeStyle;
      this.lineWidth = s.lineWidth;
      this.lineCap = s.lineCap;
      this.lineDash = s.lineDash;
      this.globalAlpha = s.globalAlpha;
      this.font = s.font;
      this.textAlign = s.textAlign;
    }
  }

  setTransform(_a, _b, _c, _d, _e, _f) {
    // Virtual scaling handled by viewBox
  }

  beginPath() {
    this.currentPath = '';
  }

  moveTo(x, y) {
    this.currentPath += `M ${Number(x.toFixed(2))} ${Number(y.toFixed(2))} `;
  }

  lineTo(x, y) {
    this.currentPath += `L ${Number(x.toFixed(2))} ${Number(y.toFixed(2))} `;
  }

  closePath() {
    this.currentPath += 'Z ';
  }

  arc(x, y, r, startAngle, endAngle) {
    const sweep = Math.abs(endAngle - startAngle);
    if (sweep >= 2 * Math.PI - 0.05) {
      // Full circle
      this.elements.push(
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${this.fillStyle}" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" opacity="${this.globalAlpha}" />`,
      );
    } else {
      const x1 = x + r * Math.cos(startAngle);
      const y1 = y + r * Math.sin(startAngle);
      const x2 = x + r * Math.cos(endAngle);
      const y2 = y + r * Math.sin(endAngle);
      const largeArc = sweep > Math.PI ? 1 : 0;
      this.currentPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} `;
    }
  }

  ellipse(x, y, rx, ry, _rotation, startAngle, endAngle) {
    const sweep = Math.abs(endAngle - startAngle);
    if (sweep >= 2 * Math.PI - 0.05) {
      this.elements.push(
        `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="${this.fillStyle}" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" opacity="${this.globalAlpha}" />`,
      );
    }
  }

  stroke() {
    if (!this.currentPath.trim()) return;
    const dash = this.lineDash.length ? ` stroke-dasharray="${this.lineDash.join(',')}"` : '';
    this.elements.push(
      `<path d="${this.currentPath.trim()}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" stroke-linecap="${this.lineCap}"${dash} opacity="${this.globalAlpha}" />`,
    );
  }

  fill() {
    if (!this.currentPath.trim()) return;
    this.elements.push(
      `<path d="${this.currentPath.trim()}" fill="${this.fillStyle}" stroke="none" opacity="${this.globalAlpha}" />`,
    );
  }

  fillRect(x, y, w, h) {
    this.elements.push(
      `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${this.fillStyle}" opacity="${this.globalAlpha}" />`,
    );
  }

  strokeRect(x, y, w, h) {
    this.elements.push(
      `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" opacity="${this.globalAlpha}" />`,
    );
  }

  fillText(text, x, y) {
    let anchor = 'start';
    if (this.textAlign === 'center') anchor = 'middle';
    else if (this.textAlign === 'right') anchor = 'end';

    // Parse font size if possible
    let fontSize = '12px';
    const m = String(this.font).match(/(\d+(?:\.\d+)?px)/);
    if (m) fontSize = m[1];

    this.elements.push(
      `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${this.fillStyle}" font-family="monospace, sans-serif" font-size="${fontSize}" text-anchor="${anchor}" opacity="${this.globalAlpha}">${escapeXml(text)}</text>`,
    );
  }

  measureText(text) {
    let fontSize = 12;
    const m = String(this.font).match(/(\d+(?:\.\d+)?)px/);
    if (m) fontSize = parseFloat(m[1]);
    return { width: text.length * fontSize * 0.6 };
  }

  setLineDash(d) {
    this.lineDash = Array.isArray(d) ? d : [];
  }

  toSvg() {
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}">`,
      `<rect width="${this.width}" height="${this.height}" fill="#111318" />`,
      ...this.elements,
      `</svg>`,
    ].join('\n');
  }
}
