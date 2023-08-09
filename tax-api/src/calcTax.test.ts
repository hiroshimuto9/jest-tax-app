import { calcRetirementIncomeDeduction, calcTaxableRetirementIncome } from './calcTax'

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