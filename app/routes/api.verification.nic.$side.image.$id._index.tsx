import { LoaderArgs } from '@remix-run/node'
import { prisma } from '~/db.server'

export async function loader({ params }: LoaderArgs) {
  const id = params.id
  const side = params.side

  const user = await prisma.seller.findUnique({
    where: { id },
    select: {
      nationalIdentityCard: {
        select: side === 'front' ? { front: true } : { back: true },
      },
    },
  }) as any
  if (!user?.nationalIdentityCard) {
    return new Response(null, { status: 404 })
  }
  const buffer = side === 'front'
    ? user?.nationalIdentityCard?.front
    : user?.nationalIdentityCard?.back
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  })
}
