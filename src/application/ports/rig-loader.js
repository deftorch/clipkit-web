/**
 * RigLoader port interface.
 * Defines contract for parsing binary/JSON avatar files into runtime rig models.
 */
export class RigLoader {
  parseRigFile(_buffer, _fileName, _baseRig) {
    throw new Error('RigLoader.parseRigFile must be implemented');
  }
}
