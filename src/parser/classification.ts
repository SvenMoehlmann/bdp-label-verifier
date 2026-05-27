export interface Classification {
  title: string;
  underClassification?: Map<string, Classification>;
}

const laughUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Regular laugth', underClassification: undefined }],
  ['2', { title: 'Quiet/cry laugh', underClassification: undefined }],
  ['3', { title: 'Giggling', underClassification: undefined }],
]);

const vocalizedUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Speaking', underClassification: undefined }],
  ['2', { title: 'Shouting', underClassification: undefined }],
  ['3', { title: 'Bajinoise or other', underClassification: undefined }],
  ['4', { title: 'Yawn', underClassification: undefined }],
  ['5', { title: 'Speaking + Environment', underClassification: undefined }],
  ['6', { title: 'Speaking + Ukelele', underClassification: undefined }],
]);

const nonVocalizedUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Consonant part of speech', underClassification: undefined }],
  ['2', { title: 'Mouth noise or similar', underClassification: undefined }],
  ['3', { title: 'Breathing', underClassification: undefined }],
]);

const singingUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Singing', underClassification: undefined }],
  ['2', { title: 'Mutter-singing', underClassification: undefined }],
  ['3', { title: 'Singing + Ukelele', underClassification: undefined }],
  ['4', { title: 'Rapping', underClassification: undefined }],
  ['5', { title: 'Metal Growl', underClassification: undefined }],
]);

const humanUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Vocalized Sound', underClassification: vocalizedUnderClass }],
  ['2', { title: 'Laugh', underClassification: laughUnderClass }],
  ['3', { title: 'Nonvocolized Sound', underClassification: nonVocalizedUnderClass }],
  ['4', { title: 'Singing', underClassification: singingUnderClass }],
]);

const environmentUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Keyboard', underClassification: undefined }],
  ['2', { title: 'MouseClicks', underClassification: undefined }],
  ['3', { title: 'Static', underClassification: undefined }],
  ['4', { title: 'Thuds', underClassification: undefined }],
  ['5', { title: 'Ukelele', underClassification: undefined }],
]);

const whistlingUnderClass: Map<string, Classification> = new Map<string, Classification>([
  ['0', { title: 'Uncategorized', underClassification: undefined }],
  ['1', { title: 'Whistling', underClassification: undefined }],
  ['2', { title: 'Whistling + Ukelele', underClassification: undefined }],
]);

export const classifications: Map<string, Classification> = new Map<string, Classification>([
  ['1', { title: 'Baji', underClassification: humanUnderClass }],
  ['2', { title: 'Lowji', underClassification: humanUnderClass }],
  ['3', { title: 'Environmental', underClassification: environmentUnderClass }],
  ['4', { title: 'Whistling', underClassification: whistlingUnderClass }],
  ['5', { title: 'Other Humans', underClassification: undefined }],
]);

export const getClassification = (code: string) => {
  if (code.length !== 3) return undefined;

  const firstClass = classifications.get(code[0]);
  if (!firstClass) return undefined;
  if (!firstClass.underClassification)
    return code.substring(1, 2) === '00' ? [firstClass] : undefined;

  const secondClass = firstClass.underClassification.get(code[1]);
  if (!secondClass) return undefined;
  if (!secondClass.underClassification)
    return code[2] === '0' ? [firstClass, secondClass] : undefined;

  const thirdClass = secondClass.underClassification.get(code[2]);
  if (!thirdClass) return undefined;
  return [firstClass, secondClass, thirdClass];
};
