export const MaterialTypeJa = {
    bo: 'ボトル', 
    ca:'カートン',
    inCa: '内側カートン',
    outCa: '外側カートン',
    la: 'ラベル',
    tr: 'トリガー',
    ba: '詰め替え袋',
    pr: '商品',
    com: '得意先',
    all: '全資材'
};

export const MaterialTypeEn = {
    bo: 'bottle',
    ca: 'carton',
    inCa: 'inCarton',
    outCa: 'outCarton',
    la: 'label',
    tr: 'trigger',
    ba: 'bag',
    pr: 'product',
    com: 'company',
    all: 'all'
};

export function convertEnToJa(typeEn: string): string {
    switch(typeEn) {
        case MaterialTypeEn.bo:
            return MaterialTypeJa.bo;
        case MaterialTypeEn.tr:
            return MaterialTypeJa.tr;
        case MaterialTypeEn.la:
            return MaterialTypeJa.la;
        case MaterialTypeEn.ca:
            return MaterialTypeJa.ca;
        case MaterialTypeEn.inCa:
            return MaterialTypeJa.inCa;
        case MaterialTypeEn.outCa:
            return MaterialTypeJa.outCa;
        case MaterialTypeEn.ba:
            return MaterialTypeJa.ba;
        case MaterialTypeEn.com:
            return MaterialTypeJa.com;
        case MaterialTypeEn.pr:
            return MaterialTypeJa.pr;
        case MaterialTypeEn.all:
            return MaterialTypeJa.all;
        default:
            console.error(`typeおかしい : ${typeEn}`);
            return null;
    }
}