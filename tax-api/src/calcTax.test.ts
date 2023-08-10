import { calcRetirementIncomeDeduction, calcTaxableRetirementIncome, calcIncomeTaxBase, calcTaxWithheld, calcIncomeTaxForSeverancePay } from './calcTax'

describe('退職所得控除額', () => {
  const testDeduction = (yearsOfService: number, isDisability: boolean, expected: number) => {
    const deduction = calcRetirementIncomeDeduction({
      yearsOfService,
      isDisability,
    })
    expect(deduction).toBe(expected);
  };

  describe('勤続年数が1年の場合', () => {
    describe('障害者となったことに直接基因して退職」に該当しない場合', () => {
      test.each`
        yearsOfService | expected
        ${1}|${800_000}
      `('勤続年数$yearsOfService年→$expected円', ({ yearsOfService, expected }) => {
        testDeduction(yearsOfService, false, expected)
      })
    })

    describe('障害者となったことに直接基因して退職」に該当する場合', () => {
      test.each`
        yearsOfService | expected
        ${1}|${1_800_000}
      `('勤続年数$yearsOfService年→$expected円', ({ yearsOfService, expected }) => {
        testDeduction(yearsOfService, true, expected)
      })
    })
  })

  describe('勤続年数が2年以上20年未満の場合', () => {
    describe('障害者となったことに直接基因して退職」に該当しない場合', () => {
      test.each`
        yearsOfService | expected
        ${2}|${800_000}
        ${3}|${1_200_000}
        ${19}|${7_600_000}
      `('勤続年数$yearsOfService年→$expected円', ({ yearsOfService, expected }) => {
        testDeduction(yearsOfService, false, expected)
      })
    })

    describe('障害者となったことに直接基因して退職」に該当する場合', () => {
      test.each`
        yearsOfService | expected
        ${2}|${1_800_000}
        ${3}|${2_200_000}
        ${19}|${8_600_000}
      `('勤続年数$yearsOfService年→$expected円', ({ yearsOfService, expected }) => {
        testDeduction(yearsOfService, true, expected)
      })
    })
  })

  describe('勤続年数が20年以上の場合', () => {
    describe('障害者となったことに直接基因して退職」に該当しない場合', () => {
      test.each`
        yearsOfService | expected
        ${20}|${8_000_000}
        ${21}|${8_700_000}
        ${30}|${15_000_000}
      `('勤続年数$yearsOfService年→$expected円', ({ yearsOfService, expected }) => {
        testDeduction(yearsOfService, false, expected)
      })
    })

    describe('障害者となったことに直接基因して退職」に該当する場合', () => {
      test.each`
        yearsOfService | expected
        ${20}|${9_000_000}
        ${21}|${9_700_000}
        ${30}|${16_000_000}
      `('勤続年数$yearsOfService年→$expected円', ({ yearsOfService, expected }) => {
        testDeduction(yearsOfService, true, expected)
      })
    })
  })
})

describe('課税退職所得金額', () => {
  // 勤続年数が 6 年以上の場合
  describe('勤続年数が6年以上の場合', () => {
    test.each`
      yearsOfService | severancePay | deduction | isBoardMember | expected
      ${6} | ${3_000_000} | ${2_400_000} | ${false} | ${300_000}
      ${6} | ${3_000_000} | ${2_400_000} | ${true}   | ${300_000}
      ${6} | ${3_001_999} | ${2_400_000} | ${false}  | ${300_000}
      ${6} | ${3_001_999} | ${2_400_000} | ${true}   | ${300_000}
      ${6} | ${3_002_000} | ${2_400_000} | ${false}  | ${301_000}
      ${6} | ${3_002_000} | ${2_400_000} | ${true}   | ${301_000}
      ${6} | ${1_000_000} | ${2_400_000} | ${false}  | ${0}
      ${6} | ${1_000_000} | ${2_400_000} | ${true}   | ${0}
    `(
      '勤続年数$yearsOfService年・退職金$severancePay円・退職所得控除額$deduction円・' +
      '役員等$isOfficer → $expected円',
      ({ yearsOfService, severancePay, deduction, isBoardMember, expected }) => {
        const taxableIncome = calcTaxableRetirementIncome({
          yearsOfService,
          severancePay,
          isBoardMember,
          retirementIncomeDeduction: deduction,
        })
        expect(taxableIncome).toBe(expected)
      },
    )
  })

  describe('役員等で勤続年数が5年以下の場合', () => {
    test.each`
      yearsOfService | severancePay | deduction    | expected
      ${5}           | ${3_000_000} | ${2_000_000} | ${1_000_000}
      ${5}           | ${3_000_999} | ${2_000_000} | ${1_000_000}
      ${5}           | ${3_001_000} | ${2_000_000} | ${1_001_000}
      ${5}           | ${1_000_000} | ${2_000_000} | ${0}
    `(
      '勤続年数$yearsOfService年・退職金$severancePay円・退職所得控除額$deduction円 → ' +
      '$expected円',
      ({ yearsOfService, severancePay, deduction, expected }) => {
        const taxableIncome = calcTaxableRetirementIncome({
          yearsOfService,
          severancePay,
          isBoardMember: true,
          retirementIncomeDeduction: deduction,
        })
        expect(taxableIncome).toBe(expected)
      },
    )
  })

  describe('役員等以外で勤続年数が5年以下の場合', () => {
    describe('控除後の金額が300万円以下の場合', () => {
      test.each`
        yearsOfService | severancePay | deduction    | expected
        ${5}           | ${3_000_000} | ${2_000_000} | ${500_000}
        ${5}           | ${5_000_000} | ${2_000_000} | ${1_500_000}
        ${5}           | ${3_001_999} | ${2_000_000} | ${500_000}
        ${5}           | ${3_002_000} | ${2_000_000} | ${501_000}
        ${5}           | ${1_000_000} | ${2_000_000} | ${0}
      `(
        '勤続年数$yearsOfService年・退職金$severancePay円・退職所得控除額$deduction円 → ' +
        '$expected円',
        ({ yearsOfService, severancePay, deduction, expected }) => {
          const taxableIncome = calcTaxableRetirementIncome({
            yearsOfService,
            severancePay,
            isBoardMember: false,
            retirementIncomeDeduction: deduction,
          })
          expect(taxableIncome).toBe(expected)
        },
      )
    })

    describe('控除後の金額が300万円を超える場合', () => {
      test.each`
        yearsOfService | severancePay | deduction    | expected
        ${5}           | ${6_000_000} | ${2_000_000} | ${2_500_000}
        ${5}           | ${6_001_999} | ${2_000_000} | ${2_501_000}
        ${5}           | ${6_002_000} | ${2_000_000} | ${2_502_000}
      `(
        '勤続年数$yearsOfService年・退職金$severancePay円・退職所得控除額$deduction円 → ' +
        '$expected円',
        ({ yearsOfService, severancePay, deduction, expected }) => {
          const taxableIncome = calcTaxableRetirementIncome({
            yearsOfService,
            severancePay,
            isBoardMember: false,
            retirementIncomeDeduction: deduction,
          })
          expect(taxableIncome).toBe(expected)
        },
      )
    })
  })
})

describe('基準所得税額', () => {
  test.each`
    taxableRetirementIncome | expected
    ${0}                    | ${0}
    ${1_000}                | ${50}
    ${1_949_000}            | ${97_450}
    ${1_950_000}            | ${97_500}
    ${3_299_000}            | ${232_400}
    ${3_300_000}            | ${232_500}
    ${6_949_000}            | ${962_300}
    ${6_950_000}            | ${962_500}
    ${8_999_000}            | ${1_433_770}
    ${9_000_000}            | ${1_434_000}
    ${17_999_000}           | ${4_403_670}
    ${18_000_000}           | ${4_404_000}
    ${39_999_000}           | ${13_203_600}
    ${40_000_000}           | ${13_204_000}
  `('課税退職所得金額$taxableRetirementIncome円→$expected円', ({ taxableRetirementIncome, expected }) => {
    const incomeTaxBase = calcIncomeTaxBase({
      taxableRetirementIncome
    })
    expect(incomeTaxBase).toBe(expected)
  })
})

describe('所得税の源泉徴収税額', () => {
  test.each`
    incomeTaxBase | expected
    ${0}          | ${0}
    ${50}         | ${51}
    ${120}        | ${122}
    ${1000}       | ${1021}
  `('基準所得税額$incomeTaxBase円→$expected円', ({ incomeTaxBase, expected }) => {
    const taxWithheld = calcTaxWithheld({
      incomeTaxBase
    })
    expect(taxWithheld).toBe(expected)
  })
})

describe('退職金の所得税', () => {
  test.each`
    yearsOfService | isDisability | isBoardMember | severancePay | expected
    ${5}  | ${false} | ${false} | ${8_000_000} | ${482422}
    ${10} | ${false} | ${false} | ${8_000_000} | ${104652}
    ${5}  | ${true}  | ${false} | ${8_000_000} | ${278222}
    ${10} | ${true}  | ${false} | ${8_000_000} | ${76575}
    ${5}  | ${false} | ${true}  | ${8_000_000} | ${788722}
    ${10} | ${false} | ${true}  | ${8_000_000} | ${104652}
    ${5}  | ${true}  | ${true}  | ${8_000_000} | ${584522}
    ${10} | ${true}  | ${true}  | ${8_000_000} | ${76575}
  `(
    '勤続年数$yearsOfService年・障害者となったことに直接基因して退職:$isDisability・' +
    '役員等:$isOfficer・退職金$severancePay円 → $expected円', ({ yearsOfService, isDisability, isBoardMember, severancePay, expected }) => {
      const tax = calcIncomeTaxForSeverancePay({
        yearsOfService,
        isDisability,
        isBoardMember,
        severancePay,
      })
      expect(tax).toBe(expected)
    })
  /* eslint-disable @typescript-eslint/no-explicit-any */
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
      `('勤続年数$yearsOfService年はエラー', ({ yearsOfService }) => {
        expect(() => calcIncomeTaxForSeverancePay({
          yearsOfService,
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
        })).toThrow('Invalid argument.')
      })

      test.each`
        yearsOfService | expected
        ${1}           | ${39991549}
        ${100}         | ${4496484}
      `('勤続年数$yearsOfService年は成功', ({ yearsOfService, expected }) => {
        expect(calcIncomeTaxForSeverancePay({
          yearsOfService,
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
        })).toBe(expected)
      })

      test('勤続年数が未定義の場合はエラー', () => {
        expect(() => calcIncomeTaxForSeverancePay({
          isDisability: false,
          isBoardMember: false,
          severancePay: 100_000_000,
        } as any)).toThrow('Invalid argument.')
      })
    })

    describe('障害者となったことに直接基因して退職したかは真偽値であること', () => {
      test.each`
        isDisability
        ${null}
        ${undefined}
        ${'something string'}
      `('障害者となったことに直接基因して退職したか：$isDisabilityはエラー', ({ isDisability }) => {
        expect(() => calcIncomeTaxForSeverancePay({
          yearsOfService: 1,
          isDisability,
          isBoardMember: false,
          severancePay: 100_000_000,
        })).toThrow('Invalid argument.')
      })

      test('障害者となったことに直接基因して退職したかが未定義の場合はエラー', () => {
        expect(() => calcIncomeTaxForSeverancePay({
          yearsOfService: 1,
          isBoardMember: false,
          severancePay: 100_000_000,
        } as any)).toThrow('Invalid argument.')
      })
    })

    describe('役員等かどうかは真偽値であること', () => {
      test.each`
        isBoardMember
        ${null}
        ${undefined}
        ${'something string'}
      `('役員等かどうか：$isBoardMemberはエラー', ({ isBoardMember }) => {
        expect(() => calcIncomeTaxForSeverancePay({
          yearsOfService: 1,
          isDisability: false,
          isBoardMember,
          severancePay: 100_000_000,
        })).toThrow('Invalid argument.')
      })

      test('役員等かどうかかが未定義の場合はエラー', () => {
        expect(() => calcIncomeTaxForSeverancePay({
          yearsOfService: 1,
          isDisability: false,
          severancePay: 100_000_000,
        } as any)).toThrow('Invalid argument.')
      })
    })
  })
  /* eslint-enable */
})