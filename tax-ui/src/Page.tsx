import { useState } from 'react'
import { SubmitHandler } from 'react-hook-form'

import { Heading, HStack, Spacer, VStack } from '@chakra-ui/react'

import { FormInputs, InputForm } from './InputForm'
import { Result } from './Result'
import { CalcTaxParam, CalcTaxResult, useCalcTax } from './useCalcTax'

type PresentationProps = {
  tax: number | null
  onInputFormSubmit: SubmitHandler<FormInputs>
}

export const Presentation = ({ tax, onInputFormSubmit }: PresentationProps) => (
  <VStack marginY={5} spacing={5} w="100%" minW="800px">
    <Heading>退職金の所得税計算アプリケーション</Heading>
    <HStack w="100%">
      <Spacer />
      <InputForm w="400px" h="500px" onInputFormSubmit={onInputFormSubmit} />
      <Result w="400px" h="500px" tax={tax} />
      <Spacer />
    </HStack>
  </VStack>
)

export const Page = () => {
  const [tax, setTax] = useState<number | null>(null)

  // フックを使用してmutate関数を取得する
  const { mutate } = useCalcTax()

  const handleInputFormSubmit = (formInputs: FormInputs) => {
    // フォームとAPIパラメータで型が異なるので変換
    const params: CalcTaxParam = {
      yearsOfService: Number(formInputs.yearsOfService),
      isDisability: formInputs.isDisability,
      isBoardMember: !!Number(formInputs.isBoardMember),
      severancePay: Number(formInputs.severancePay),
    }

    // API呼び出し
    mutate(params, {
      onSuccess: async (data) => {
        if (data.ok) {
          const json = (await data.json()) as CalcTaxResult
          setTax(json.tax)
        }
      },
    })
  }

  return <Presentation tax={tax} onInputFormSubmit={handleInputFormSubmit} />
}
