import { BudgetItem } from '../types/budget';

const STORAGE_KEY = 'berkeley_budget_data';

function parseAmount(value: string): number {
  if (!value || value.trim() === '') return 0;

  const cleanValue = value.replace(/[$,]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function importBudgetData(): Promise<BudgetItem[]> {
  try {
    const fileUrl = new URL('../data/FY26 Budget - Sheet2.csv', import.meta.url);
    const response = await fetch(fileUrl.href);
    const csvText = await response.text();

    const lines = csvText.split('\n');
    const budgetItems: BudgetItem[] = [];

    console.log('Total CSV lines:', lines.length);

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

      // Clean the fields
      const cleanField = (field: string) => {
        if (!field) return '';
        return field.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
      };

      const cleanedFields = fields.map(cleanField);
      
      // Ensure we have at least 8 fields (pad with empty strings if needed)
      while (cleanedFields.length < 8) {
        cleanedFields.push('');
      }

      const [orgCode, fund, objectCode, description, fy2023, fy2024, fy2025, fy2026] = cleanedFields;

      if (!description) continue;

      const now = new Date().toISOString();
      budgetItems.push({
        id: generateId(),
        org_code: orgCode,
        fund: fund,
        object_code: objectCode,
        description: description,
        fy2023_budget: parseAmount(fy2023),
        fy2024_budget: parseAmount(fy2024),
        fy2025_budget: parseAmount(fy2025),
        fy2026_budget: parseAmount(fy2026),
        created_at: now,
        updated_at: now
      });
    }

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetItems));
    console.log(`✅ Successfully imported ${budgetItems.length} budget items`);
    console.log('Sample item:', budgetItems[0]);
    
    return budgetItems;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}

export async function checkDataExists(): Promise<boolean> {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null && stored !== '';
}

export async function getBudgetData(): Promise<BudgetItem[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing stored data:', error);
    return [];
  }
}
