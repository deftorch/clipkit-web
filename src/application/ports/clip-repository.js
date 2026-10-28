/**
 * ClipRepository port interface.
 * Defines persistence contract for saving and loading animation clips.
 */
export class ClipRepository {
  loadSavedClips() {
    throw new Error('ClipRepository.loadSavedClips must be implemented');
  }

  saveClips(_data) {
    throw new Error('ClipRepository.saveClips must be implemented');
  }
}
