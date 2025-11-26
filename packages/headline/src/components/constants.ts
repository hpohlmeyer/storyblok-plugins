export type FieldData = {
  text: string;
  element: ElementOption;
  style?: {
    value: StyleOption;
    option: StyleInputOption;
  };
} | '';

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const SHADOW_BOTTOM_SIZE = 17;

export type ElementOption = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export const ELEMENT_VALUES: Array<ElementOption> = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
export const DEFAULT_ELEMENT_VALUE: ElementOption = 'h2';
export const ELEMENT_OPTIONS = ELEMENT_VALUES.map((value) => ({ label: capitalize(value), value }));

export type StyleOption = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export const STYLE_VALUES: Array<StyleOption> = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export type StyleInputOption = StyleOption | 'default';
export const STYLE_INPUT_VALUES: Array<StyleInputOption> = ['default', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
export const STYLE_OPTIONS = STYLE_INPUT_VALUES.map((value) => ({ label: capitalize(value), value }));