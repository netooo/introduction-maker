'use client'

import { SoccerTemplate } from './SoccerTemplate'
import { BaseballTemplate } from './BaseballTemplate'
import type { TemplateProps } from './TemplateBase'

export const TemplateRenderer: React.FC<TemplateProps> = (props) => {
  const { template } = props

  switch (template.type) {
    case 'soccer':
      return <SoccerTemplate {...props} />
    case 'baseball':
      return <BaseballTemplate {...props} />
    default:
      return <SoccerTemplate {...props} /> // デフォルトはサッカー
  }
}