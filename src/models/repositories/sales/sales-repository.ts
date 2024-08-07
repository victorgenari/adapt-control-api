import prismaClient from '../../../config/prisma-client'

import type { Sales } from '../../interfaces/sales'
import { RestRepository } from '../rest-repository'

class Repository extends RestRepository {
	async findAllSales(skip: number, take: number, filters: any): Promise<Sales> {
		const whereClause = {
			deleted_at: null,
			...filters,
		}

		const [data, total] = await prismaClient.$transaction([
			prismaClient.sale.findMany({
				where: whereClause,
				include: {
					payment: true,
					Sale_relationship_product: {
						include: {
							product: {
								include: {
									category: true,
								},
							},
						},
					},
				},
				skip,
				take,
			}),
			prismaClient.sale.count({
				where: whereClause,
			}),
		])

		const pages = Math.ceil(total / take)
		const currentPage = Math.ceil(skip / take) + 1

		return {
			data,
			total,
			pages,
			currentPage,
		}
	}
}

const SalesRepository = new Repository('sale')

export default SalesRepository
