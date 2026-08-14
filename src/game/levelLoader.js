import level01 from '../data/levels/level-01.json';
import level02 from '../data/levels/level-02.json';
import level03 from '../data/levels/level-03.json';
import level04 from '../data/levels/level-04.json';
import level05 from '../data/levels/level-05.json';
import level06 from '../data/levels/level-06.json';

export async function loadLevels() {
  return [level01, level02, level03, level04, level05, level06];
}
