/**
 * Panel registry managing UI tab panels and refresh lifecycles.
 */
export class PanelRegistry {
  constructor() {
    this.panels = new Map();
  }

  register(panel) {
    if (!panel || !panel.id) {
      throw new Error('Panel must have an id');
    }
    this.panels.set(panel.id, panel);
    return this;
  }

  get(id) {
    return this.panels.get(id);
  }

  getAll() {
    return Array.from(this.panels.values());
  }

  getIds() {
    return Array.from(this.panels.keys());
  }

  setTab(activeId, ptabsEl) {
    if (ptabsEl) {
      for (const b of ptabsEl.children) {
        b.setAttribute('aria-selected', String(b.dataset.p === activeId));
      }
    }
    for (const [id, panel] of this.panels.entries()) {
      if (panel.el) {
        panel.el.hidden = id !== activeId;
      }
      if (id === activeId && typeof panel.onSelect === 'function') {
        panel.onSelect();
      }
    }
  }

  refreshAll(context = {}) {
    for (const panel of this.panels.values()) {
      if (typeof panel.render === 'function') {
        panel.render(context);
      }
    }
  }
}
