import { Location } from './location';

export interface Inventory {
	id: string;
	targetId: string;
	targetName: string;
	arrLocationId: string[];
	locationCount: object;
	actionType: string;
	actionDetail: string;
	addCount: number;
	sumCount: number;
	date: Date;
	userName: string;
	memo: string;
	latestPath: string;
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
		arrLocationId: [''],
		locationCount: null,
		actionType: '',
		actionDetail: '',
		addCount: 0,
		sumCount: 0,
		date: null,
		userName: '',
		memo: '',
		latestPath: '',
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