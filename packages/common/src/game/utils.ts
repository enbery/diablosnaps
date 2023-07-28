import { AffixId, AffixType, Affixes, ItemQuality, ItemType, ItemVariant, Items, Language, Translations } from './types/index.js';

export function getItemName(
    id: string,
    language: Language,
    items: Items,
): string {
    return items[language][id];
}

export function getItemTypeLine(
    variant: ItemVariant,
    quality: ItemQuality,
    type: ItemType,
    language: Language,
    translations: Translations
): string {
    let format = '{VARIANT} {QUALITY} {TYPE}';
    switch (language) {
        case Language.German:
        case Language.Polish:
        case Language.Russian:
        case Language.Turkish:
            format = '{VARIANT} {TYPE}';
            break;
        case Language.Mexican:
        case Language.Italian:
        case Language.French:
            format = '{TYPE} {VARIANT}';
            break;
        case Language.Spanish:
        case Language.Portuguese:
            format = '{TYPE} {QUALITY}';
            break;
        case Language.Japanese:
        case Language.SimplifiedChinese:
        case Language.TraditionalChinese:
            format = '{VARIANT}{QUALITY}{TYPE}';
            break;
    }

    return replaceVariables(format, {
        variant: getItemVariantText(variant, language, translations) || '',
        quality: getItemQualityText(quality, language, translations) || '',
        type: getItemTypeText(type, language, translations) || '',
    }).trim();
}

export function getItemVariantText(
    variant: ItemVariant,
    language: Language,
    translations: Translations
): string {
    return translations[language][`ItemQuality${variant}`];
}

export function getItemQualityText(
    quality: ItemQuality,
    language: Language,
    translations: Translations
): string {
    return translations[language][`ItemQuality${quality}`];
}

export function getItemTypeText(
    type: ItemType,
    language: Language,
    translations: Translations
): string {
    return translations[language][`ItemType${type}`];
}

export function getItemAffixText(
    id: AffixId,
    language: Language,
    type: AffixType,
    power: number,
    value: number,
    affixes: Affixes,
): string {
    const definition = affixes.definitions[type][id];
    if (!definition) {
        return '';
    }

    const text = definition.attributes
        .map(attribute => {

            const { ranges } = affixes.attributes[attribute.id];
            let range = ranges[0];
            if (ranges.length > 1) {
                for (let i = 1; i < ranges.length; i++) {
                    if (ranges[i].minItemPower <= power &&
                        ranges[i].minItemPower > range.minItemPower
                    ) {
                        range = ranges[i];
                    }
                }
            }

            const descriptionId = `${attribute.id}${isNaN(attribute.param) ? '' : `#${attribute.param}`}`;
            const description = affixes.descriptions[language][descriptionId];

            const hasValue = !isNaN(value) && value >= 0 && value <= 1;
            const template = replaceVariables(description, {
                value: range && hasValue
                    ? `${range.minValue + (range.maxValue - range.minValue) * value}`
                    : '#',
            });
            return executeFormulas(template, !hasValue);
        })
        .join(' ');
    return text;
}

function replaceVariables(
    template: string,
    variables: Record<string, string>
) {
    return template
        .replace(/\{([^}]+)\}/g, (_, key: string) => {
            const value = variables[key.toLocaleLowerCase()];
            return value === undefined ? `{${key}}` : `${value}`;
        });
}

function roundValue(
    value: number,
    decimals: number
) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

function formatValue(
    value: number | string,
    format: string
) {
    switch (format) {
        case '~': return `${typeof value === 'string' ? value : Math.round(value)}`;
        case '~%': return `${typeof value === 'string' ? value : Math.round(value)}%`;

        case '1': return `${typeof value === 'string' ? value : value.toFixed(1)}`;
        case '1%x': return `${typeof value === 'string' ? value : value.toFixed(1)}%[x]`;
        case '1%':
        case '%1':
            return `${typeof value === 'string' ? value : value.toFixed(1)}%`;
        case '1%+': return `+${typeof value === 'string' ? value : value.toFixed(1)}%`;

        case '2': return `${typeof value === 'string' ? value : value.toFixed(2)}`;
        case '2%x': return `${typeof value === 'string' ? value : value.toFixed(2)}%[x]`;
        case '2%':
        case '%2':
            return `${typeof value === 'string' ? value : value.toFixed(2)}%`;
        case '2%+': return `+${typeof value === 'string' ? value : value.toFixed(2)}%`;

        case '%x': return `${typeof value === 'string' ? value : roundValue(value, 3)}%[x]`;
        case '%': return `${typeof value === 'string' ? value : roundValue(value, 3)}%`;
        case '+%':
        case '%+':
            return `+${typeof value === 'string' ? value : roundValue(value, 3)}%`;
        case '': return `${typeof value === 'string' ? value : roundValue(value, 3)}`;
        default:
            console.warn('Unknown format', format);
            return `${typeof value === 'string' ? value : roundValue(value, 3)}`;
    }
}

function executeFormulas(
    template: string,
    ignoreParserError: boolean
) {
    return template
        .replace(/\[([^\]]+)\]/g, (_, formula: string) => {
            if (formula === 'x') return '[x]';
            let format = '';
            const expression = formula
                .replace(/\}/g, '')
                .replace(/\|([^|]+)\|/g, (_, key) => {
                    format = key;
                    return '';
                });

            try {
                const value: number = Function(`return ${expression}`)();
                return formatValue(value, format);
            } catch (error) {
                if (!ignoreParserError) {
                    console.warn('Failed to parse expression', expression, error);
                }
                return formatValue('#', format);
            }
        });
}
