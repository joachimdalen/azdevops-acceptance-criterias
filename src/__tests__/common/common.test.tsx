import {
  mockGetContributionId,
  mockGetProject,
  mockGetResourceAreaLocation
} from '../../__mocks__/azure-devops-extension-sdk';
import { chunk } from '../../common/chunkUtil';
import { capitalizeFirstLetter, getUrl, move } from '../../common/common';

describe('common', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirstLetter('mystring')).toEqual('Mystring');
    });
  });
  describe('move', () => {
    it('should move item', () => {
      const items = [1, 2, 3, 4];
      move(items, 1, -1);
      expect(items).toEqual([2, 1, 3, 4]);
    });
    it('should not move item from end to start', () => {
      const items = [1, 2, 3, 4];
      move(items, 3, 1);
      expect(items).toEqual([1, 2, 3, 4]);
    });
  });
  describe('getUrl', () => {
    it('should throw if project is null', async () => {
      mockGetResourceAreaLocation.mockResolvedValue('https://myapp.local/');
      mockGetProject.mockResolvedValue(undefined);

      expect(async () => await getUrl({ id: '12345-rit' })).rejects.toThrowError(
        'Cannot get project'
      );
    });
    it('should return correct url', async () => {
      mockGetResourceAreaLocation.mockResolvedValue('https://myapp.local/');
      mockGetProject.mockResolvedValue({ name: 'MyProject' });
      mockGetContributionId.mockReturnValue('criteria.hub');
      const url = await getUrl({ id: '12345-rit' });

      expect(url).toEqual('https://myapp.local/MyProject/_apps/hub/criteria.hub?id=12345-rit');
    });
  });
});
