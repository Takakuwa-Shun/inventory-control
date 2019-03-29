export interface Location{
    id: string;
    name: string;
    nameKana: string;
    isFactory: boolean;
}

export function initLocation(): Location {
	const result: Location= {
        id: '',
        name: '',
        nameKana: '',
        isFactory: false,
	}
	return result;
}