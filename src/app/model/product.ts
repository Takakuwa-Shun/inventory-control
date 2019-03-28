import { Material, initMaterial } from './material';
import { Company, initCompany } from './company';

interface BaseProduct{
    id: string;
    name: string;
    nameKana: string;
    imageUrl: string;
}

export interface DetailProduct extends BaseProduct {
    companyData: Company;
    bottleData: Material;
    inCartonData: Material;
    outCartonData: Material;
    labelData: Material;
    triggerData: Material;
    bagData: Material;
}

export interface Product extends BaseProduct {
    companyId: string;
    companyName: string;
    bottleId: string;
    bottleName: string;
    inCartonId: string;
    inCartonName: string;
    outCartonId: string;
    outCartonName: string;
    labelId: string;
    labelName: string;
    triggerId: string;
    triggerName: string;
    bagId: string;
    bagName: string;
}

export function convertDetailProductToProduct(product: DetailProduct): Product {
    return {
        id: product.id,
        name: product.name.trim(),
        nameKana: product.nameKana.trim(),
        imageUrl: product.imageUrl,
        companyId: product.companyData.id,
        companyName: product.companyData.name,
        bottleId: product.bottleData.id,
        bottleName: product.bottleData.name,
        inCartonId: product.inCartonData.id,
        inCartonName: product.inCartonData.name,
        outCartonId: product.outCartonData.id,
        outCartonName: product.outCartonData.name,
        labelId: product.labelData.id,
        labelName: product.labelData.name,
        triggerId: product.triggerData.id,
        triggerName: product.triggerData.name,
        bagId: product.bagData.id,
        bagName: product.bagData.name,
    };
}

export function initDetailProduct(): DetailProduct {

    const bo = initMaterial();
    const ca1 = initMaterial();
    const ca2 = initMaterial();
    const la = initMaterial();
    const tr = initMaterial();
    const ba = initMaterial();
    const com = initCompany();

	const result: DetailProduct = {
        id: '',
        name: '',
        nameKana: '',
        imageUrl: '',
        bottleData: bo,
        inCartonData: ca1,
        outCartonData: ca2,
        labelData: la,
        triggerData: tr,
        bagData: ba,
        companyData: com
	}
	return result;
}