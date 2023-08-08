type CalcRetirementIncomeDeductionInput = {
  yearsOfService: number
  isDisability: boolean
}

export const calcRetirementIncomeDeduction = (input: CalcRetirementIncomeDeductionInput) => {
  let result
  if (input.yearsOfService === 1) {
    result = 800_000
  } else if (input.yearsOfService <= 19) {
    result = 400_000 * input.yearsOfService
  } else {
    result = 8_000_000 + 700_000 * (input.yearsOfService - 20)
  }
  if (input.isDisability) {
    result += 1_000_000
  }
  return result
};