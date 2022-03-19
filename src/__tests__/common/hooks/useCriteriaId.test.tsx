import { renderHook } from '@testing-library/react-hooks';

import { mockGetQueryParams } from '../../../__mocks__/azure-devops-extension-sdk';
import useCriteriaId from '../../../common/hooks/useCriteriaId';

describe('useCriteriaId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return undefined when no query params', async () => {
    mockGetQueryParams.mockReturnValue({});
    const { result } = renderHook(() => useCriteriaId());
    expect(result.current).toBeUndefined();
  });
  it('should return undefined when query params but not expected', () => {
    mockGetQueryParams.mockReturnValue({ hello: 'john' });
    const { result } = renderHook(() => useCriteriaId());

    expect(result.current).toBeUndefined();
  });
  it('should return id when query params', async () => {
    mockGetQueryParams.mockResolvedValue({ criteriaId: '1234' });
    const { result, waitForNextUpdate } = renderHook(() => useCriteriaId());
    await waitForNextUpdate();

    expect(result.current).toEqual('1234');
  });
});
