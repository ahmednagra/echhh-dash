"use client";
import React from 'react';

interface TableProps<T extends { id: number }> {
  headers: string[];
  data: T[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  headerMap: Record<string, keyof T>;
}

const Table = <T extends { id: number }>({
  headers,
  data,
  onEdit,
  onDelete,
  headerMap
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {headers.map((header) => (
              <th 
                key={header} 
                className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {headers.map((header) => {
                const dataKey = headerMap[header];
                const cellValue = row[dataKey];
                
                return (
                  <td key={header} className="px-6 py-4 border-b border-gray-200">
                    {React.isValidElement(cellValue) 
                      ? cellValue 
                      : String(cellValue)}
                  </td>
                );
              })}
              <td className="px-6 py-4 border-b border-gray-200 text-right">
                <button
                  onClick={() => onEdit(row.id)}
                  className="text-blue-600 hover:text-blue-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(row.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;