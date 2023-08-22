import { act, waitFor } from '@testing-library/react'
import { renderHook } from './test-utils'
import { useCalcTax } from './useCalcTax'

describe('useCalcTax', () => {
  test('所得税計算APIを呼び出せる', async () => {
    // フックをレンダリング
    const { result } = renderHook(() => useCalcTax())

    // フックから返されたmutate関数を仕様してAPIを呼び出す
    act(() => {
      result.current.mutate({
        yearsOfService: 6,
        isDisability: false,
        isBoardMember: false,
        severancePay: 3_000_000,
      })
    })

    // フックの結果が成功になるまで待つ
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // ステータスコードとレスポンスボディのJSONデータを確認
    expect(result.current.data?.status).toBe(200)
    expect(await result.current.data?.json()).toStrictEqual({ tax: 15315 })
  })
})
