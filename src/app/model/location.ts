export interface Location{
    id: string;
    name: string;
    nameKana: string;
}

export function initLocation(): Location {
	const result: Location= {
        id: '',
        name: '',
        nameKana: '',
	}
	return result;
}