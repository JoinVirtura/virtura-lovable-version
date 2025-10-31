interface SmartRule {
  field: string;
  operator: 'equals' | 'contains' | '>' | '<' | 'between';
  value: any;
}

interface SmartRules {
  rules: SmartRule[];
  operator: 'AND' | 'OR';
}

export const applySmartRules = (assets: any[], smartRules: SmartRules): any[] => {
  if (!smartRules || !smartRules.rules || smartRules.rules.length === 0) {
    return assets;
  }

  return assets.filter(asset => {
    const results = smartRules.rules.map(rule => {
      const fieldValue = getNestedValue(asset, rule.field);

      switch (rule.operator) {
        case 'equals':
          return fieldValue === rule.value;

        case 'contains':
          if (Array.isArray(fieldValue)) {
            return fieldValue.some(v => 
              String(v).toLowerCase().includes(String(rule.value).toLowerCase())
            );
          }
          return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());

        case '>':
          if (rule.field === 'created_at' || rule.field.includes('date')) {
            return new Date(fieldValue) > new Date(rule.value);
          }
          return Number(fieldValue) > Number(rule.value);

        case '<':
          if (rule.field === 'created_at' || rule.field.includes('date')) {
            return new Date(fieldValue) < new Date(rule.value);
          }
          return Number(fieldValue) < Number(rule.value);

        case 'between':
          if (Array.isArray(rule.value) && rule.value.length === 2) {
            const val = Number(fieldValue);
            return val >= Number(rule.value[0]) && val <= Number(rule.value[1]);
          }
          return false;

        default:
          return false;
      }
    });

    // Apply AND/OR logic
    if (smartRules.operator === 'AND') {
      return results.every(r => r === true);
    } else {
      return results.some(r => r === true);
    }
  });
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};
