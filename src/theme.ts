import { Platform, type ViewStyle } from 'react-native';

export const colors = {
  canvas: '#F3EFE6',
  canvasDeep: '#EAE4D7',
  surface: '#FFFFFF',
  ink: '#1B241F',
  inkSoft: '#5A635D',
  muted: '#8C928C',
  line: '#E5DFD2',
  brand: '#1F4A3A',
  brandDeep: '#143327',
  brandSoft: '#E7EFE9',
  gold: '#C69A62',
  available: { fg: '#1C6B45', bg: '#E5F1E9', dot: '#2F8C5B' },
  reserved: { fg: '#98600D', bg: '#FBF0DA', dot: '#D3982E' },
  booked: { fg: '#3D4B9C', bg: '#E9EBF9', dot: '#5967C9' },
  danger: '#A64B33',
  dangerSoft: '#F7E9E4',
  white: '#FFFFFF',
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  body: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const cardShadow: ViewStyle =
  Platform.select<ViewStyle>({
    web: { boxShadow: '0 12px 30px rgba(27, 36, 31, 0.07)' },
    default: {
      shadowColor: '#1B241F',
      shadowOpacity: 0.07,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 3,
    },
  }) ?? {};

export const layout = {
  maxWidth: 560,
  gutter: 20,
} as const;
