import { APP_LIMITS } from './constants'
import type { ConversionSettings } from '../../types/image'

export interface TargetDimensions {
  height: number
  width: number
}

export function computeTargetDimensions(
  sourceWidth: number,
  sourceHeight: number,
  settings: ConversionSettings,
): TargetDimensions {
  const safeWidth = clampDimension(settings.width)
  const safeHeight = clampDimension(settings.height)

  switch (settings.resizeMode) {
    case 'width': {
      const nextWidth = safeWidth ?? sourceWidth
      const nextHeight = settings.keepAspectRatio
        ? Math.round((sourceHeight * nextWidth) / sourceWidth)
        : sourceHeight

      return clampDimensions(nextWidth, nextHeight, sourceWidth, sourceHeight)
    }
    case 'height': {
      const nextHeight = safeHeight ?? sourceHeight
      const nextWidth = settings.keepAspectRatio
        ? Math.round((sourceWidth * nextHeight) / sourceHeight)
        : sourceWidth

      return clampDimensions(nextWidth, nextHeight, sourceWidth, sourceHeight)
    }
    case 'exact': {
      if (!safeWidth && !safeHeight) {
        return { width: sourceWidth, height: sourceHeight }
      }

      const boxWidth = safeWidth ?? sourceWidth
      const boxHeight = safeHeight ?? sourceHeight

      if (!settings.keepAspectRatio) {
        return clampDimensions(boxWidth, boxHeight, sourceWidth, sourceHeight)
      }

      const widthScale = boxWidth / sourceWidth
      const heightScale = boxHeight / sourceHeight
      const scale = Math.min(widthScale, heightScale, 1)

      return clampDimensions(
        Math.round(sourceWidth * scale),
        Math.round(sourceHeight * scale),
        sourceWidth,
        sourceHeight,
      )
    }
    case 'none':
    default:
      return { width: sourceWidth, height: sourceHeight }
  }
}

function clampDimension(value?: number): number | undefined {
  if (!value || Number.isNaN(value)) {
    return undefined
  }

  return Math.max(1, Math.min(APP_LIMITS.maxOutputDimension, Math.round(value)))
}

function clampDimensions(
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
): TargetDimensions {
  return {
    width: Math.max(1, Math.min(APP_LIMITS.maxOutputDimension, width, sourceWidth)),
    height: Math.max(1, Math.min(APP_LIMITS.maxOutputDimension, height, sourceHeight)),
  }
}
