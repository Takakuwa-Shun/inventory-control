export interface Company{
    id: string;
    name: string;
    nameKana: string;
}

export function initCompany(): Company {
	const result: Company= {
        id: '',
        name: '',
        nameKana: '',
	}
	return result;
}