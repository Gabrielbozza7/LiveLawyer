import { useEffect, useState } from 'react'
import { Animated, StyleProp, ViewStyle } from 'react-native'
import { AnimatedFAB } from 'react-native-paper'

interface FabWithConfirmationProps {
  icon: string
  prompt: string
  onConfirm: () => unknown
  visible?: boolean
  uppercase?: boolean
  animateFrom?: 'left' | 'right'
  iconMode?: 'static' | 'dynamic'
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>
}

export function FabWithConfirmation({
  icon,
  prompt,
  onConfirm,
  visible,
  uppercase,
  animateFrom,
  iconMode,
  style,
}: FabWithConfirmationProps) {
  const [confirming, setConfirming] = useState<boolean>(false)

  useEffect(() => {
    if (confirming) {
      setTimeout(() => {
        if (confirming) {
          setConfirming(false)
        }
      }, 3000)
    }
  }, [confirming])

  return (
    <AnimatedFAB
      icon={icon}
      label={prompt}
      extended={confirming}
      onPress={confirming ? onConfirm : () => setConfirming(true)}
      visible={visible}
      uppercase={uppercase ?? true}
      animateFrom={animateFrom}
      iconMode={iconMode}
      style={style}
      variant="surface"
    />
  )
}
