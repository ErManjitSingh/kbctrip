import { ComingSoon } from '../../components/ComingSoon';

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ q?: string; date?: string; guests?: string }>;
}) {
  const { product } = await params;
  const query = await searchParams;
  return <ComingSoon product={product} query={query} />;
}
