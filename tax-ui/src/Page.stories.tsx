import { Meta, StoryObj } from '@storybook/react'

import { Presentation } from './Page'

export default {
  component: Presentation,
} as Meta<typeof Presentation>

export const Standard: StoryObj<typeof Presentation> = {
  args: { tax: 10000 },
}

export const NoResult: StoryObj<typeof Presentation> = {
  args: { tax: null },
}
