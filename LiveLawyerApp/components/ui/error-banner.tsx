import { newStyles } from '@/constants/Styles'
import { Banner, Text } from 'react-native-paper'

interface ErrorBannerProps {
  text: string
}

export function ErrorBanner({ text }: ErrorBannerProps) {
  return (
    <Banner visible={true} icon="alert-circle-outline" elevation={4} style={newStyles.spacedCard}>
      <Text variant="bodyMedium">{text}</Text>
    </Banner>
  )
}
