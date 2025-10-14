export interface FlowDataItem {
  classification: string;
  description: string;
  fy2025: number;
  fy2026: number;
}

function parseAmount(value: string): number {
  if (!value || value.trim() === '') return 0;
  const cleanValue = value.replace(/[$,]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

const FLOW_STORAGE_KEY = 'berkeley_budget_flow_data';

export async function importFlowData(): Promise<FlowDataItem[]> {
  try {
    const fileUrl = new URL('../data/FY26 Budget - Sheet1.csv', import.meta.url);
    const response = await fetch(fileUrl.href);
    const csvText = await response.text();

    const lines = csvText.split('\n');
    const flowItems: FlowDataItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma, but respect quoted fields
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());

      const cleanField = (field: string) => {
        if (!field) return '';
        return field.replace(/^"|"$/g, '').trim();
      };

      const [classification, description, fy2025, fy2026] = fields.map(cleanField);

      // Skip if no classification or description
      if (!classification || !description) continue;

      flowItems.push({
        classification,
        description,
        fy2025: parseAmount(fy2025),
        fy2026: parseAmount(fy2026)
      });
    }

    localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flowItems));
    console.log(`✅ Successfully imported ${flowItems.length} flow items`);
    
    return flowItems;
  } catch (error) {
    console.error('Error importing flow data:', error);
    throw error;
  }
}

export async function checkFlowDataExists(): Promise<boolean> {
  const stored = localStorage.getItem(FLOW_STORAGE_KEY);
  return stored !== null && stored !== '';
}

export async function getFlowData(): Promise<FlowDataItem[]> {
  const stored = localStorage.getItem(FLOW_STORAGE_KEY);
  if (!stored) {
    return [];
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing stored flow data:', error);
    return [];
  }
}

