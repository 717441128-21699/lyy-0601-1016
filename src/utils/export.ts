import * as XLSX from 'xlsx';
import { AnalysisDetailRecord, ExportField } from '@/types/analysis';
import { formatDate, formatMoney } from './format';

export const exportToExcel = (
  data: AnalysisDetailRecord[],
  fields: ExportField[],
  activityName: string
): void => {
  const selectedFields = fields.filter(f => f.selected);
  const headers = selectedFields.map(f => f.label);
  const keys = selectedFields.map(f => f.key) as (keyof AnalysisDetailRecord)[];
  
  const rows = data.map(item => 
    keys.map(key => {
      const value = item[key];
      if (key === 'date' && typeof value === 'string') {
        return formatDate(value);
      }
      if (key === 'salesAmount' && typeof value === 'number') {
        return formatMoney(value);
      }
      if (key === 'avgOrderValue' && typeof value === 'number') {
        return formatMoney(value);
      }
      return value;
    })
  );
  
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  ws['!cols'] = selectedFields.map(() => ({ wch: 15 }));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '活动明细');
  
  const timestamp = formatDate(new Date(), 'YYYYMMDDHHmmss');
  const filename = `${activityName}_复盘明细_${timestamp}.xlsx`;
  
  XLSX.writeFile(wb, filename);
};

export const exportToCSV = (
  data: AnalysisDetailRecord[],
  fields: ExportField[],
  activityName: string
): void => {
  const selectedFields = fields.filter(f => f.selected);
  const headers = selectedFields.map(f => f.label).join(',');
  const keys = selectedFields.map(f => f.key) as (keyof AnalysisDetailRecord)[];
  
  const rows = data.map(item => 
    keys.map(key => {
      const value = item[key];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const timestamp = formatDate(new Date(), 'YYYYMMDDHHmmss');
  const filename = `${activityName}_复盘明细_${timestamp}.csv`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getWatermarkText = (): string => {
  const user = '运营人员';
  const date = formatDate(new Date());
  return `${user} ${date} 智慧零售促销活动管理后台`;
};
