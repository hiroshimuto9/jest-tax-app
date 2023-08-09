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

type CalcTaxableRetirementIncomeInput = {
  yearsOfService: number
  severancePay: number
  isBoardMember: boolean
  retirementIncomeDeduction: number
}

/**
 * 課税退職所得金額を計算する
 * @param input 退職金 / 退職所得控除額
 * @returns 課税退職所得金額
 */
export const calcTaxableRetirementIncome = (input: CalcTaxableRetirementIncomeInput): number => {
  const targetIncome = input.severancePay - input.retirementIncomeDeduction
  if (targetIncome <= 0) return 0

  const calc = () => {
    // 勤続年数が6年以上の場合は通常の計算
    if (input.yearsOfService >= 6) return targetIncome / 2
    // 勤続年数が5年以下の場合
    // 役員等の場合、1/2の計算は適用されない
    if (input.isBoardMember) return targetIncome
    // 役員等以外の場合
    // 控除後の金額が300万円を超える部分は1/2を適用しない。つまり300万円までは1/2を適用する
    if (targetIncome > 3_000_000) return targetIncome - 1_500_000
    // いずれも該当しない場合は通常の計算
    return targetIncome / 2
  }
  // 1000円未満の端数は切り捨て
  return Math.floor(calc() / 1000) * 1000
}