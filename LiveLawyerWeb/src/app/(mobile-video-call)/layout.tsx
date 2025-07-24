export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <body style={{ backgroundColor: 'black' }}>{children}</body>
}
