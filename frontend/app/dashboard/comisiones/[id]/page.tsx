import { ComisionDashboard } from "@/components/academico/comision-dashboard"

export default async function ComisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ComisionDashboard comisionId={id} />
}
