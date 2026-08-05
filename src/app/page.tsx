import { api } from '@/lib/eden'

export default async function Page() {
  const { data } = await api.db.get()
  return <div>{data ? `${data.orm} on ${data.dialect}: ${data.status}` : null}</div>
}
