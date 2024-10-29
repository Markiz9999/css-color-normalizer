export function multiply(a: number[][], b: number[][]): number[][] {
  const aNumRows = a.length;
  const aNumCols = a[0].length;
  const bNumCols = b[0].length;
  const m = new Array(aNumRows);
  for (let r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols);
    for (let c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;
      for (let i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }

  return m;
}
