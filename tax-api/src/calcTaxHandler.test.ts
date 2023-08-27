import request from 'supertest'
import app from './app'

describe('POST /calc-tax', () => {
  test('退職金の所得税を計算する', async () => {
    const res = await request(app).post('/calc-tax').send({
      yearsOfService: 6,
      isDisability: false,
      isBoardMember: false,
      severancePay: 3_000_000,
    })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual({ tax: 15315 })
  })

  describe('入力値バリデーション', () => {
    describe('勤続年数は1以上100以下の整数であること', () => {
      test.each`
        yearsOfService
        ${-1}
        ${0}
        ${101}
        ${10.5}
        ${null}
        ${undefined}
        ${'something string'}
      `('勤続年数$yearsOfService年はエラー', async ({ yearsOfService }) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService,
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test.each`
        yearsOfService | expected
        ${1}           | ${39991549}
        ${100}         | ${4496484}
      `('勤続年数$yearsOfService年は成功', async ({ yearsOfService, expected }) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService,
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual({ tax: expected })
      })

      test('勤続年数が未定義の場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send({
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })
    })

    describe('障害者となったことに直接基因して退職したかは真偽値であること', () => {
      test.each`
        isDisability
        ${null}
        ${undefined}
        ${'something string'}
      `('障害者となったことに直接基因して退職したか：$isDisabilityはエラー', async ({ isDisability }) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 1,
          isDisability,
          isBoardMember: false,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test('障害者となったことに直接基因して退職したかが未定義の場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 1,
          isBoardMember: false,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })
    })

    describe('役員等かどうかは真偽値であること', () => {
      test.each`
        isBoardMember
        ${null}
        ${undefined}
        ${'something string'}
      `('役員等かどうか：$isBoardMemberはエラー', async ({ isBoardMember }) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 1,
          isDisability: false,
          isBoardMember,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test('役員等かどうかかが未定義の場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 1,
          isDisability: false,
          severancePay: 100_000_000,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })
    })

    describe('退職金は0以上1000000000000以下の整数であること', () => {
      test.each`
        severancePay
        ${-1}
        ${1_000_000_000_001}
        ${100_000.5}
        ${null}
        ${undefined}
        ${'something string'}
      `('退職金$severancePay円はエラー', async ({ severancePay }) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 5,
          isDisability: false,
          isBoardMember: false,
          severancePay,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test.each`
        severancePay | expected
        ${0}           | ${0}
        ${1_000_000_000_000} | ${229705400884}
      `('退職金$severancePay円は成功', async ({ severancePay, expected }) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 100,
          isDisability: false,
          isBoardMember: false,
          severancePay,
        })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual({ tax: expected })
      })

      test('退職金が未定義の場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 5,
          isDisability: false,
          isBoardMember: false,
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })
    })

    describe('不正なオブジェクトの場合', () => {
      test('意図していないプロパティが含まれる場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 100,
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
          unknownProperty: 'something',
        })
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test('空オブジェクトの場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send({})
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test('オブジェクトでない場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send('')
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test('undefinedの場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send(undefined)
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })

      test('nullの場合はエラー', async () => {
        const res = await request(app).post('/calc-tax').send(null as any)
        expect(res.status).toBe(400)
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' })
      })
    })
  })
})

describe('OPTIONS /calc-tax', () => {
  test('フロントエンドのオリジンからのアクセスを許可する', async () => {
    const res = await request(app).options('/calc-tax')
    expect(res.status).toBe(204)
    expect(res.header['access-control-allow-origin']).toBe(
      'http://localhost:3001',
    )
  })
})