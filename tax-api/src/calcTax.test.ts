import { calcRetirementIncomeDeduction } from './calcTax'

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