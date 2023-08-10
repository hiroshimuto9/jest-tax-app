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


type CalcIncomeTaxBase = {
  taxableRetirementIncome: number
}

/**
 * 基準所得税額を計算する
 * @param input 課税退職所得金額 / 税率 / 控除額
 * @returns 基準所得税額
 */
export const calcIncomeTaxBase = (input: CalcIncomeTaxBase): number => {
  if (input.taxableRetirementIncome === 0) return 0

  // 基準所得税額 = 課税退職所得金額 × 税率 - 控除額
  const calc = (income: number, taxRate: number, deduction: number) => {
    return (income * taxRate) / 100 - deduction
  }

  // 課税退職所得金額の上限値、税率、控除額を保持
  const taxBrackets = [
    { limit: 1_949_000, rate: 5, deduction: 0 },
    { limit: 3_299_000, rate: 10, deduction: 97_500 },
    { limit: 6_949_000, rate: 20, deduction: 427_500 },
    { limit: 8_999_000, rate: 23, deduction: 636_000 },
    { limit: 17_999_000, rate: 33, deduction: 1_536_000 },
    { limit: 39_999_000, rate: 40, deduction: 2_796_000 },
    { limit: Infinity, rate: 45, deduction: 4_796_000 },
  ];

  const bracket = taxBrackets.find(taxBracket => input.taxableRetirementIncome <= taxBracket.limit);

  // limitにInfinityが設定されているため、undefinedが返ってくることは起こり得ないが、将来の変更に備えてエラーハンドリングを実装
  if (!bracket) {
    throw new Error("Tax bracket not found");
  }

  return calc(input.taxableRetirementIncome, bracket.rate, bracket.deduction)
}

type CalcTaxWithheld = {
  incomeTaxBase: number
}

/**
 * 所得税の源泉徴収税額を計算する
 * @param input 基準所得税額
 * @returns 所得税の源泉徴収税額
 */
export const calcTaxWithheld = (input: CalcTaxWithheld): number => {
  // 浮動小数点演算による丸め誤差を回避するため、整数計算を行う
  const taxWithheld = Math.floor((input.incomeTaxBase * 1021) / 1000)
  return taxWithheld
}