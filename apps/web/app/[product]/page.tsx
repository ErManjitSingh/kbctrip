import { ComingSoon } from '../../components/ComingSoon';

export default async function ProductPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  return <ComingSoon product={product} />;
}
