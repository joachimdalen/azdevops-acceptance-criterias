import { renderHook } from '@testing-library/react-hooks';

import { mockGetDevOpsQueryParameters } from '../../../__mocks__/@joachimdalen/azdevops-ext-core/DevOpsService';
import useCriteriaId from '../../../common/hooks/useCriteriaId';

describe('useCriteriaId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return undefined when no query params', async () => {
    mockGetDevOpsQueryParameters.mockReturnValue({});
    const { result } = renderHook(() => useCriteriaId());
    expect(result.current).toBeUndefined();
  });
  it('should return undefined when query params but not expected', () => {
    mockGetDevOpsQueryParameters.mockReturnValue({ hello: 'john' });
    const { result } = renderHook(() => useCriteriaId());

    expect(result.current).toBeUndefined();
  });
  it('should return id when query params', async () => {
    mockGetDevOpsQueryParameters.mockResolvedValue({ criteriaId: '1234' });
    const { result, waitForNextUpdate } = renderHook(() => useCriteriaId());
    await waitForNextUpdate();

    expect(result.current).toEqual('1234');
  });
});
