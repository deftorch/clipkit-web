/**
 * MeshRenderer port interface.
 * Defines contract for mounting 3D canvas, posing, and rendering 3D avatar meshes.
 */
export class MeshRenderer {
  mount(_canvas) {
    throw new Error('MeshRenderer.mount must be implemented');
  }

  load(_key, _buffer) {
    throw new Error('MeshRenderer.load must be implemented');
  }

  unload() {
    throw new Error('MeshRenderer.unload must be implemented');
  }

  has(_key) {
    throw new Error('MeshRenderer.has must be implemented');
  }

  pose(_pose, _rig) {
    throw new Error('MeshRenderer.pose must be implemented');
  }

  render(_width, _height, _dpr, _eye, _target, _fov) {
    throw new Error('MeshRenderer.render must be implemented');
  }
}
