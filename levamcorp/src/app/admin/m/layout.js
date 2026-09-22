export const metadata = {
  title: 'Levam Admin',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Levam Admin' },
  formatDetection: { telephone: false },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B1220',
}

export default function MobileAdminLayout({ children }) {
  return children
}
