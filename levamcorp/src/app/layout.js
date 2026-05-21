import './globals.css'
import FloatingButtons from './FloatingButtons'

export const metadata = {
  title: 'Levam Corp Distributors',
  description: 'B2B Wholesale Distribution — Doral, FL',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <FloatingButtons />
      </body>
    </html>
  )
}
