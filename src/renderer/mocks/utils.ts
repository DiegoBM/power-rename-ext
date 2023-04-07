export function asMock(fn: Function): jest.Mock {
  return fn as jest.Mock;
}
