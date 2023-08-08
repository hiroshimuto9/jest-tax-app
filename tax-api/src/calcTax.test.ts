import { calcRetirementIncomeDeduction } from './calcTax'

describe('退職所得控除', () => {
  test.each`
    yearsOfService | isDisability | expected
    ${1}|${false}|${800_000}
    ${2}|${false}|${800_000}
    ${3}|${false}|${1_200_000}
    ${19}|${false}|${7_600_000}
    ${20}|${false}|${8_000_000}
    ${21}|${false}|${8_700_000}
    ${30}|${false}|${15_000_000}
    ${1}|${true}|${1_800_000}
    ${2}|${true}|${1_800_000}
    ${3}|${true}|${2_200_000}
    ${19}|${true}|${8_600_000}
    ${20}|${true}|${9_000_000}
    ${21}|${true}|${9_700_000}
    ${30}|${true}|${16_000_000}
  `('yearsOfService年 isDisability:$isDisability→$expected', ({ yearsOfService, isDisability, expected }) => {
    const deduction = calcRetirementIncomeDeduction({
      yearsOfService,
      isDisability,
    })
    expect(deduction).toBe(expected);
  })
})