import { Rider } from '@prisma/client'
import { prisma } from '~/db.server'

export async function createRider(
  data: Pick<
    Rider,
    'name' | 'phone' | 'email' | 'address' | 'username' | 'passwordHash'
  >,
) {
  return prisma.rider.create({
    data,
  })
}

export async function getRiderByUsername(username: string) {
  return prisma.rider.findFirst({ where: { username } })
}
export async function getRiderById(id: string) {
  return prisma.rider.findFirst({ where: { id } })
}

export async function getAllRiders() {
  return prisma.rider.findMany({
    select: { username: true, id: true, name: true, email: true, phone: true },
  })
}

export async function deleteRiderById(id: string) {
  return prisma.rider.delete({ where: { id } })
}
export async function updateRiderPasswordById(id: string, hash: string) {
  return prisma.rider.update({ where: { id }, data: { passwordHash: hash } })
}
