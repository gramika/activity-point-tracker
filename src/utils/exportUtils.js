import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'export') => {
  try {
    // Prepare the data for export
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add column widths for better readability
    const wscols = [
      { wch: 25 },  // Student Name
      { wch: 25 },  // Activity Type
      { wch: 15 },  // Activity Level
      { wch: 10 },  // Points
      { wch: 25 },  // Organizing Body
    ];
    
    worksheet['!cols'] = wscols;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};