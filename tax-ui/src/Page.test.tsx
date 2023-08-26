import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { Page } from './Page'
import { render, waitForRequest } from './test-utils'

const server = setupServer(
  rest.post('http://localhost:3000/calc-tax', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ tax: 10000 }))
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  server.events.removeAllListeners()
})
afterAll(() => {
  server.close()
})

const waitForCalcTaxRequest = () =>
  waitForRequest(server, 'POST', 'http://localhost:3000/calc-tax')

describe('ページコンポーネント', () => {
  test('所得税を計算できる', async () => {
    const pendingRequest = waitForCalcTaxRequest()

    const user = userEvent.setup()

    render(<Page />)
    await user.click(screen.getByText('所得税を計算する'))

    // 所得税(MSWから返された金額)が表示されるまで待つ
    await waitFor(() =>
      expect(screen.getByLabelText('tax').textContent).toBe('10,000円'),
    )

    // API呼び出しに利用したパラメータの確認
    const request = await pendingRequest
    expect(await request.json()).toStrictEqual({
      yearsOfService: 10,
      isDisability: false,
      isBoardMember: false,
      severancePay: 5_000_000,
    })
  })
})
