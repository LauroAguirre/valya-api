export const formatPropertiesForPrompt = (
  properties: Array<{
    id: string
    name: string
    type: string | null
    neighborhood: string | null
    city: string | null
    totalPrice: number | null
    bedrooms: number | null
    garageCount: number | null
    privateArea: number | null
    description: string | null
    minDown: number | null
    installments: number | null
    installmentValue: number | null
  }>
) => {
  return properties
    .map((p, i) => {
      const parts = [`Imovel ${i + 1}: ${p.name}`]
      if (p.type) parts.push(`Tipo: ${p.type}`)
      if (p.neighborhood) parts.push(`Bairro: ${p.neighborhood}`)
      if (p.city) parts.push(`Cidade: ${p.city}`)
      if (p.totalPrice)
        parts.push(`Valor: R$ ${p.totalPrice.toLocaleString('pt-BR')}`)
      if (p.bedrooms) parts.push(`Quartos: ${p.bedrooms}`)
      if (p.garageCount) parts.push(`Vagas: ${p.garageCount}`)
      if (p.privateArea) parts.push(`Area: ${p.privateArea}m2`)
      if (p.minDown)
        parts.push(`Entrada minima: R$ ${p.minDown.toLocaleString('pt-BR')}`)
      if (p.installments && p.installmentValue) {
        parts.push(
          `Parcelas: ${p.installments}x de R$ ${p.installmentValue.toLocaleString('pt-BR')}`
        )
      }
      if (p.description)
        parts.push(`Descricao: ${p.description.substring(0, 150)}`)
      return parts.join(' | ')
    })
    .join('\n')
}
