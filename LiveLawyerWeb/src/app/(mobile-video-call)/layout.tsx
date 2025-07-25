export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <body style={{ display: 'flex', backgroundColor: 'black' }}>{children}</body>
}
