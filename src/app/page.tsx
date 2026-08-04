import { api } from '@/lib/eden'

export default async function Page() {
  const { data } = await api.db.get()
  return <div>{data?.map(d => d.bar)}</div>
}
