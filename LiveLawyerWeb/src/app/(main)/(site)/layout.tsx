import LiveLawyerNav from '@/components/LiveLawyerNav'

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <LiveLawyerNav />
      {children}
    </>
  )
}
