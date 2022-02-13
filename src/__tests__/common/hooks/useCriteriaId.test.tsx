import { renderHook } from '@testing-library/react-hooks';

import { mockGetQueryParams } from '../../../__mocks__/azure-devops-extension-sdk';
import useCriteriaId from '../../../common/hooks/useCriteriaId';
jest.mock('azure-devops-extension-api');
describe('useCriteriaId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return undefined when no query params', () => {
    mockGetQueryParams.mockReturnValue(undefined);
    const { result } = renderHook(() => useCriteriaId());

    expect(result.current).toBeUndefined();
  });
  it('should return undefined when query params but not expected', () => {
    mockGetQueryParams.mockReturnValue({ hello: 'john' });
    const { result } = renderHook(() => useCriteriaId());

    expect(result.current).toBeUndefined();
  });
  it('should return id when query params', () => {
    mockGetQueryParams.mockReturnValue({ criteriaId: '1234' });
    const { result } = renderHook(() => useCriteriaId());
    console.log(result.all, result.current);
    expect(result.current).toEqual('1234');
  });
});
