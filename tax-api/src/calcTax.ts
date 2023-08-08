type CalcRetirementIncomeDeductionInput = {
  yearsOfService: number
  isDisability: boolean
}

/**
 * 退職所得控除額を計算する
 * @param input 勤続年数 / 障害者起因可否
 * @returns 退職所得控除額
 */
export const calcRetirementIncomeDeduction = (input: CalcRetirementIncomeDeductionInput): number => {
  /**
   * 勤続年数が20年未満の場合：40万 x 金属年数
   * 勤続年数が20年以上の場合：800万円 + 70万円 x (勤続年数 - 20年)
   */
  const baseDeduction = input.yearsOfService < 20 ? 400_000 * input.yearsOfService : 8_000_000 + 700_000 * (input.yearsOfService - 20)

  // 計算結果が80万未満の場合は、退職所得控除額は80万円になる
  const adjustedDeduction = baseDeduction < 800_000 ? 800_000 : baseDeduction;

  // 障害者となったことに直接基因して退職した場合は、上記により計算した金額に、100万円を加算した金額が退職所得控除額となる
  const finalDeduction = input.isDisability ? adjustedDeduction + 1_000_000 : adjustedDeduction;

  return finalDeduction
};