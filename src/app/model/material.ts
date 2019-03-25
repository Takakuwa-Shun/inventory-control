export interface Material{
    id: string;
    name: string;
    nameKana: string;
    type: string;
    limitCount: number | string;
    imageUrl: string;
}

export function initMaterial(): Material {
	const result: Material= {
        id: '',
        name: '',
        nameKana: '',
        type: '',
        limitCount: null,
        imageUrl: ''
	}
	return result;
}