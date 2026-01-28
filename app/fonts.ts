import localFont from 'next/font/local'

export const roboto = localFont({
  src: [
    {
      path: '../public/fonts/roboto-cyrillic-700-normal.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/roboto-cyrillic-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    // ... остальные веса
  ],
  variable: '--font-roboto',
  display: 'swap',
})