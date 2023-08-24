import { useState } from 'react'
import { SubmitHandler } from 'react-hook-form'

import { Heading, HStack, Spacer, VStack } from '@chakra-ui/react'

import { FormInputs, InputForm } from './InputForm'
import { Result } from './Result'

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
  // TODO APIからデータを取得する
  const [tax] = useState(10000)

  const handleInputFormSubmit = (formInputs: FormInputs) => {
    console.log('formInputs', formInputs)
  }

  return <Presentation tax={tax} onInputFormSubmit={handleInputFormSubmit} />
}
