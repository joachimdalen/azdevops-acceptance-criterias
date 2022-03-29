import { chunk } from '../../common/chunkUtil';

describe('chunkUtil', () => {
  it('should create correct chunks', () => {
    const items = Array(...Array(5)).map(function (x, i) {
      return i;
    });

    const chunks = chunk(items, 2);
    expect(chunks.length).toEqual(3);
    expect(chunks[0].length).toEqual(2);
    expect(chunks[1].length).toEqual(2);
    expect(chunks[2].length).toEqual(1);
  });
  it('should create single chunk if smaller than size', () => {
    const items = Array(...Array(5)).map(function (x, i) {
      return i;
    });

    const chunks = chunk(items, 10);
    expect(chunks.length).toEqual(1);
    expect(chunks[0].length).toEqual(5);
  });
});
