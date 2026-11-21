import Link from 'next/link';

export default function Brand() {
  return (
    <Link href="/" className="brand">
      <b>FJ</b>
      <span>Finance<em>Jovem</em></span>
    </Link>
  );
}
