/**
 * MeshLoader port interface.
 * Defines contract for binary mesh buffer ingestion and lifecycle unloading.
 */
export class MeshLoader {
  load(_key, _buffer) {
    throw new Error('MeshLoader.load must be implemented');
  }

  unload() {
    throw new Error('MeshLoader.unload must be implemented');
  }
}
