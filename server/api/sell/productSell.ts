import {IProductSellRes} from "~/types/ISell";
import {IPriceDataObject} from "~/types/IPrice";

export default defineEventHandler(async (event) => {
    return prismaClient.product.findMany({
        include: {
            category: {
                select: {
                    name: true
                }
            },
            price: {
                select: {
                    priceData: true
                }
            }
        }
    }).then(data => {
        return data.filter(e => e.status === 1)
            .map(e => {
                const priceData = (e.price?.priceData as unknown as IPriceDataObject[])?.find(e => e.status === 1)
                console.log('pricedata',e.price?.priceData as unknown)
                return {
                    categoryName: e.category?.name,
                    categoryCode: e.categoryCode,
                    productCode: e.code,
                    productName: e.name,
                    status: e.status,
                    basePrice: priceData?.basePrice,
                    discountPrice: priceData?.discountPrice,
                    startDateApplyPrice: priceData?.startDate,
                    endDateApplyPrice: priceData?.endDate
                } as unknown as IProductSellRes
            })
    })
})