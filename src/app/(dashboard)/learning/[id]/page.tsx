import React from "react"
import { SubjectDetailView } from "@/components/learning/ui/SubjectDetailView"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { id } = await params
  return <SubjectDetailView subjectId={id} />
}
