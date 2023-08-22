import { act, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook, waitForRequest } from './test-utils'
import { useCalcTax } from './useCalcTax'

// MSWサーバーをセットアップ
const server = setupServer()
// テスト実行時の最初にサーバーの待ち受けを開始
beforeAll(() => server.listen())
// テストケース内で設定したハンドラとリスナを各テスト後にリセット
afterEach(() => {
  server.resetHandlers()
  server.events.removeAllListeners()
})
// テストの実行が全て終わった後にサーバーを停止
afterAll(() => server.close())

const waitForCalcTaxRequest = () =>
  waitForRequest(server, 'POST', 'http://localhost:3000/calc-tax')

describe('useCalcTax', () => {
  test('所得税計算APIを呼び出せる', async () => {
    // APIのモックとなるハンドラを登録し、指定したURLに対して、指定したレスポンスを返す
    server.use(
      rest.post('http://localhost:3000/calc-tax', async (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ tax: 15315 }))
      }),
    )

    // キャプチャ関数を呼び出し
    const pendingRequest = waitForCalcTaxRequest()

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

    // キャプチャされたリクエストボディの内容を確認
    const request = await pendingRequest
    expect(await request.json()).toStrictEqual({
      yearsOfService: 6,
      isDisability: false,
      isBoardMember: false,
      severancePay: 3_000_000,
    })
  })

  test('所得税計算APIがBad Requestを返す場合', async () => {
    // APIのモックとなるハンドラを登録し、指定したURLに対して、指定したレスポンスを返す
    server.use(
      rest.post('http://localhost:3000/calc-tax', async (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ message: 'Invalid parameter.' }))
      }),
    )
    const { result } = renderHook(() => useCalcTax())
    act(() => {
      result.current.mutate({
        yearsOfService: 6,
        isDisability: false,
        isBoardMember: false,
        severancePay: 3_000_000,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // TanStack Query は 400 をエラーとはみなさない
    expect(result.current.isError).toBe(false)
    expect(result.current.data?.status).toBe(400)
    expect(await result.current.data?.json()).toStrictEqual({
      message: 'Invalid parameter.',
    })
  })
})
