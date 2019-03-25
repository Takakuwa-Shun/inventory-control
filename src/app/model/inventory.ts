import { Location } from './location';

export interface Inventory {
	id: string;
	targetId: string;
	targetName: string;
	locationId: string;
	locationCount: object;
	actionType: string;
	actionDetail: string;
	addCount: number;
	sumCount: number;
	date: Date;
	userId: string;
	memo: string;
}

export const ActionType = {
    move: '倉庫間移動',
    purchase: '仕入れ', 
	manufacture: '製造',
	consume: '使用',
	adjust: '在庫調整',
};

export function initInventory(): Inventory {
	const result: Inventory = {
		id: '',
		targetId: '',
		targetName: '',
		locationId: '',
		locationCount: null,
		actionType: '',
		actionDetail: '',
		addCount: 0,
		sumCount: 0,
		date: null,
		userId: '',
		memo: ''
	}
	return result;
}

export function initLocationCount(listLocation: Location[]): object {

	let result: object = {};
	for(const location of listLocation) {
		result[location.id] = 0;
	}
	return result;
}